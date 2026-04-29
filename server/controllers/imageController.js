const axios = require('axios');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const AppError = require('../utils/AppError');
const { enhancePrompt } = require('../services/promptEnhancerService');
require('dotenv').config();

// Stability AI config (env-driven model selection)
const STABILITY_API_BASE_URL = 'https://api.stability.ai';
const STABILITY_MODEL = process.env.STABILITY_MODEL || 'stable-diffusion-xl-1024-v1-0';
const IS_STABLE_IMAGE_FAMILY = STABILITY_MODEL.startsWith('stable-image-') || STABILITY_MODEL.startsWith('sd3.5-');
const IS_STABLE_IMAGE_ULTRA = STABILITY_MODEL === 'stable-image-ultra';
const IS_SD35_MODEL = STABILITY_MODEL.startsWith('sd3.5-');
const SUPPORTED_SD35_MODELS = new Set(['sd3.5-large', 'sd3.5-large-turbo', 'sd3.5-medium', 'sd3.5-flash']);
const STABLE_DIFFUSION_API_URL = `${STABILITY_API_BASE_URL}/v1/generation/${STABILITY_MODEL}/text-to-image`;
const STABLE_IMAGE_ULTRA_API_URL = `${STABILITY_API_BASE_URL}/v2beta/stable-image/generate/ultra`;
const STABLE_IMAGE_SD35_API_URL = `${STABILITY_API_BASE_URL}/v2beta/stable-image/generate/sd3`;
const API_KEY = process.env.STABILITY_API_KEY;
let stabilityModelValidationPromise = null;

async function validateConfiguredStabilityModel() {
    if (!API_KEY) return;
    if (IS_STABLE_IMAGE_FAMILY) {
        if (IS_STABLE_IMAGE_ULTRA) {
            console.log('Using Stability model: stable-image-ultra (v2beta stable-image ultra endpoint)');
            return;
        }
        if (IS_SD35_MODEL && SUPPORTED_SD35_MODELS.has(STABILITY_MODEL)) {
            console.log('Using Stability model:', STABILITY_MODEL, '(v2beta stable-image sd3 endpoint)');
            return;
        }
        console.warn('Configured STABILITY_MODEL is not supported by current stable-image routing', {
            configuredModel: STABILITY_MODEL,
            supportedUltra: 'stable-image-ultra',
            supportedSd35: Array.from(SUPPORTED_SD35_MODELS)
        });
        return;
    }
    try {
        const response = await axios({
            method: 'get',
            url: `${STABILITY_API_BASE_URL}/v1/models`,
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            timeout: 10000
        });

        const models = Array.isArray(response.data) ? response.data : [];
        const ids = models
            .map((m) => m?.id || m?.name || '')
            .filter(Boolean);
        const isConfiguredModelAvailable = ids.includes(STABILITY_MODEL);

        if (!isConfiguredModelAvailable) {
            console.warn('Configured STABILITY_MODEL not found in /v1/models response', {
                configuredModel: STABILITY_MODEL,
                discoveredModelCount: ids.length
            });
        } else {
            console.log('Using Stability model:', STABILITY_MODEL);
        }
    } catch (error) {
        console.warn('Unable to validate STABILITY_MODEL via /v1/models. Continuing with configured model.', {
            configuredModel: STABILITY_MODEL,
            error: error.message
        });
    }
}

async function generateWithStableImageUltra({ prompt, negativePrompt }) {
    const form = new FormData();
    form.append('prompt', prompt);
    if (negativePrompt) {
        form.append('negative_prompt', negativePrompt);
    }
    form.append('output_format', 'png');
    form.append('aspect_ratio', '1:1');

    const response = await fetch(STABLE_IMAGE_ULTRA_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Accept': 'application/json'
        },
        body: form
    });

    let payload = null;
    try {
        payload = await response.json();
    } catch (_) {
        payload = null;
    }

    if (!response.ok) {
        const error = new Error(`Stable Image Ultra request failed: HTTP ${response.status}`);
        error.response = { status: response.status, data: payload };
        throw error;
    }

    const base64 =
        payload?.image ||
        payload?.artifacts?.[0]?.base64 ||
        null;

    if (!base64) {
        const error = new Error('Stable Image Ultra returned no image data');
        error.response = { status: response.status, data: payload };
        throw error;
    }

    return {
        base64,
        seed: payload?.seed,
        finishReason: payload?.finish_reason
    };
}

async function generateWithStableImageSd35({ prompt, negativePrompt, model }) {
    const form = new FormData();
    form.append('prompt', prompt);
    form.append('mode', 'text-to-image');
    form.append('model', model);
    if (negativePrompt) {
        form.append('negative_prompt', negativePrompt);
    }
    form.append('output_format', 'png');
    form.append('aspect_ratio', '1:1');

    const response = await fetch(STABLE_IMAGE_SD35_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Accept': 'application/json'
        },
        body: form
    });

    let payload = null;
    try {
        payload = await response.json();
    } catch (_) {
        payload = null;
    }

    if (!response.ok) {
        const error = new Error(`Stable Image SD3.5 request failed: HTTP ${response.status}`);
        error.response = { status: response.status, data: payload };
        throw error;
    }

    const base64 = payload?.image || payload?.artifacts?.[0]?.base64 || null;
    if (!base64) {
        const error = new Error('Stable Image SD3.5 returned no image data');
        error.response = { status: response.status, data: payload };
        throw error;
    }

    return {
        base64,
        seed: payload?.seed,
        finishReason: payload?.finish_reason
    };
}

async function ensureStabilityModelValidated() {
    if (!stabilityModelValidationPromise) {
        stabilityModelValidationPromise = validateConfiguredStabilityModel();
    }
    await stabilityModelValidationPromise;
}

if (API_KEY) {
    // Startup validation (non-blocking)
    stabilityModelValidationPromise = validateConfiguredStabilityModel();
}



// Generate a simple placeholder image as base64
const generatePlaceholderImage = (association) => {
    // Create a simple SVG placeholder
    const svg = `
        <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
            <rect width="512" height="512" fill="#4E8DED"/>
            <rect x="50" y="50" width="412" height="412" fill="#2B4C7E" stroke="#7C3AED" stroke-width="4"/>
            <text x="256" y="200" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle">
                ${association.anchor}
            </text>
            <text x="256" y="250" font-family="Arial, sans-serif" font-size="20" fill="#7C3AED" text-anchor="middle">
                ${association.memorableItem}
            </text>
            <text x="256" y="400" font-family="Arial, sans-serif" font-size="16" fill="#7C3AED" text-anchor="middle">
                Placeholder Image
            </text>
        </svg>
    `;

    // Convert SVG to base64
    return Buffer.from(svg).toString('base64');
};

// Ensure directories exist
const ensureDirectories = () => {
    const originalDir = path.join(__dirname, '../public/images/original');
    const optimizedDir = path.join(__dirname, '../public/images/optimized');

    if (!fs.existsSync(originalDir)) {
        fs.mkdirSync(originalDir, { recursive: true });
    }
    if (!fs.existsSync(optimizedDir)) {
        fs.mkdirSync(optimizedDir, { recursive: true });
    }

    return { originalDir, optimizedDir };
};

// Generate optimized version of an image
const generateOptimizedImage = async (originalPath, optimizedPath) => {
    try {
        await sharp(originalPath)
            .resize(800, 800, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({
                quality: 70,
                progressive: true
            })
            .toFile(optimizedPath);

        return true;
    } catch (error) {
        console.error('Error generating optimized image:', error);
        return false;
    }
};

// Generate images using Stability AI API
exports.generateImages = async (req, res) => {
    const { prompt, association, artStyle, roomType, mode, room_context, useLlm } = req.body;

    if (!association || typeof association.anchor !== 'string' || typeof association.memorableItem !== 'string') {
        throw new AppError('Invalid or missing association (anchor and memorableItem required)', 400);
    }

    const trimmedClientPrompt = typeof prompt === 'string' ? prompt.trim() : '';
    let finalPrompt = trimmedClientPrompt || null;
    let negativePrompt = '';
    let promptMeta = null;

    if (!finalPrompt) {
        console.log('No client prompt provided; expanding via LLM...', {
            anchor: association.anchor,
            mode: mode || 'normal',
            artStyle: artStyle || 'Random',
            roomType: roomType || '',
            hasRoomContext: !!(room_context && String(room_context).trim())
        });
        if (useLlm === false) {
            throw new AppError('prompt is required when useLlm is false', 400);
        }
        const contract = await enhancePrompt({
            anchor: association.anchor,
            memorableItem: association.memorableItem,
            artStyle: artStyle || 'Random',
            roomType: roomType || '',
            room_context: room_context || '',
            mode: mode || 'normal'
        });
        finalPrompt = contract.prompt;
        negativePrompt = contract.negative_prompt || '';
        promptMeta = {
            ...contract,
            llm_provider: 'anthropic',
            llm_model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5',
            image_provider: 'stabilityai',
            image_model: STABILITY_MODEL
        };
    }

    // Check if API key is configured
    if (!API_KEY) {
        console.warn('STABILITY_API_KEY is not configured. Generating placeholder image.');
        const placeholderImage = generatePlaceholderImage(association);
        return res.json({
            success: true,
            imageData: placeholderImage,
            mimeType: 'image/png',
            filename: `${Date.now()}-${association.anchor}-${association.memorableItem}.png`,
            isPlaceholder: true,
            prompt: finalPrompt,
            negative_prompt: negativePrompt,
            prompt_meta: promptMeta
        });
    }

    // Enhanced parameters for better tapestry, dais, and anchor point generation
    const promptLower = finalPrompt.toLowerCase();
    const isTapestryPrompt = promptLower.includes('tapestry');
    const isDaisPrompt = promptLower.includes('dais');
    const needsEnhancedParams = isTapestryPrompt || isDaisPrompt;
    const cfgScale = needsEnhancedParams ? 8 : 7; // Higher CFG for complex architectural elements
    const steps = needsEnhancedParams ? 35 : 30; // More steps for complex architectural elements

    try {
        await ensureStabilityModelValidated();
        console.log('Calling Stability AI API for image generation...', { model: STABILITY_MODEL });
        let imageBase64;
        let imageProviderMeta = {};

        if (IS_STABLE_IMAGE_FAMILY && !IS_STABLE_IMAGE_ULTRA && !(IS_SD35_MODEL && SUPPORTED_SD35_MODELS.has(STABILITY_MODEL))) {
            throw new AppError('Unsupported STABILITY_MODEL for stable-image endpoint in current implementation', 500, {
                configuredModel: STABILITY_MODEL,
                supportedUltra: 'stable-image-ultra',
                supportedSd35: Array.from(SUPPORTED_SD35_MODELS),
                hint: 'Set STABILITY_MODEL to stable-image-ultra, sd3.5-large, sd3.5-large-turbo, sd3.5-medium, sd3.5-flash, or a v1 generation model id'
            });
        }

        if (IS_STABLE_IMAGE_ULTRA) {
            const ultraResult = await generateWithStableImageUltra({
                prompt: finalPrompt,
                negativePrompt
            });
            imageBase64 = ultraResult.base64;
            imageProviderMeta = {
                stability_finish_reason: ultraResult.finishReason || null,
                stability_seed: ultraResult.seed ?? null
            };
        } else if (IS_SD35_MODEL) {
            const sd35Result = await generateWithStableImageSd35({
                prompt: finalPrompt,
                negativePrompt,
                model: STABILITY_MODEL
            });
            imageBase64 = sd35Result.base64;
            imageProviderMeta = {
                stability_finish_reason: sd35Result.finishReason || null,
                stability_seed: sd35Result.seed ?? null
            };
        } else {
            // Generate image using Stability v1 SDXL-style endpoint
            const response = await axios({
                method: 'post',
                url: STABLE_DIFFUSION_API_URL,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                data: {
                    text_prompts: [
                        { "text": finalPrompt, "weight": 1 },
                        ...(negativePrompt ? [{ "text": negativePrompt, "weight": -1 }] : [])
                    ],
                    cfg_scale: cfgScale,
                    height: 1024,
                    width: 1024,
                    steps: steps,
                    samples: 1
                },
                timeout: 30000 // 30 second timeout
            });
            imageBase64 = response.data?.artifacts?.[0]?.base64;
        }

        if (!imageBase64) {
            throw new AppError('Image generation service returned no image data', 502, {
                provider: 'StabilityAI',
                model: STABILITY_MODEL
            });
        }

        // Return base64 data directly without saving to disk
        const responseData = {
            success: true,
            imageData: imageBase64,
            mimeType: 'image/png',
            filename: `${Date.now()}-${association.anchor}-${association.memorableItem}.png`,
            prompt: finalPrompt,
            negative_prompt: negativePrompt,
            prompt_meta: {
                ...(promptMeta || {}),
                ...imageProviderMeta
            }
        };
        res.json(responseData);

    } catch (apiError) {
        const errorStatus = apiError.response?.status;
        const errorData = apiError.response?.data;

        // If API key is missing, invalid, or insufficient balance, generate a placeholder image (fallback)
        if (errorStatus === 401 || errorStatus === 403 || (errorData?.name === 'insufficient_balance')) {
            console.warn('Stability AI API authentication/authorization failed. Generating placeholder image.');
            const placeholderImage = generatePlaceholderImage(association);
            return res.json({
                success: true,
                imageData: placeholderImage,
                mimeType: 'image/png',
                filename: `${Date.now()}-${association.anchor}-${association.memorableItem}.png`,
                isPlaceholder: true,
                prompt: finalPrompt,
                negative_prompt: negativePrompt,
                prompt_meta: promptMeta
            });
        }

        // Map upstream errors to appropriate status codes
        if (errorStatus === 429) {
            throw new AppError('Image generation service rate limit exceeded', 429, { provider: 'StabilityAI' });
        }
        if (apiError.code === 'ECONNABORTED' || apiError.code === 'ETIMEDOUT') {
            throw new AppError('Image generation service timeout', 504, { provider: 'StabilityAI' });
        }

        // Generic upstream error
        throw new AppError('Image generation service failed', 502, {
            provider: 'StabilityAI',
            status: errorStatus
        });
    }
};

// Upload and optimize an existing image
exports.uploadImage = async (req, res) => {
    if (!req.file) {
        throw new AppError('No file uploaded', 400);
    }

    const { originalDir, optimizedDir } = ensureDirectories();

    const originalPath = path.join(originalDir, req.file.filename);
    const optimizedPath = path.join(optimizedDir, req.file.filename);

    // Move uploaded file to original directory
    // Use copyFile + unlink instead of rename to handle cross-device scenarios (e.g., Render)
    try {
        fs.copyFileSync(req.file.path, originalPath);
        fs.unlinkSync(req.file.path); // Delete temp file after successful copy
    } catch (error) {
        // If copy fails, try rename as fallback (for same-device scenarios)
        if (error.code === 'ENOENT' || error.code === 'EACCES') {
            fs.renameSync(req.file.path, originalPath);
        } else {
            // Cleanup: try to remove temp file if it still exists
            try {
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
            } catch (cleanupError) {
                // Ignore cleanup errors
            }
            throw new AppError('Failed to save uploaded file', 500, { originalError: error.message });
        }
    }

    // Generate optimized version
    const optimizationSuccess = await generateOptimizedImage(originalPath, optimizedPath);

    // Construct URLs
    // Use BACKEND_URL if set, otherwise construct from request or use production default
    let backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
        // In production (Render), use the production API URL
        if (process.env.NODE_ENV === 'production') {
            backendUrl = 'https://memory-palace-api.onrender.com';
        } else {
            // In development, use localhost
            backendUrl = `http://localhost:${process.env.PORT || 5001}`;
        }
    }
    const originalUrl = `${backendUrl}/images/original/${req.file.filename}`;
    const optimizedUrl = `${backendUrl}/images/optimized/${req.file.filename}`;

    res.json({
        success: true,
        originalUrl,
        optimizedUrl,
        optimizationSuccess,
        filename: req.file.filename
    });
};

// Get image info (for debugging)
exports.getImageInfo = async (req, res) => {
    const { filename } = req.params;
    const { originalDir, optimizedDir } = ensureDirectories();

    const originalPath = path.join(originalDir, filename);
    const optimizedPath = path.join(optimizedDir, filename);

    const originalExists = fs.existsSync(originalPath);
    const optimizedExists = fs.existsSync(optimizedPath);

    // Use BACKEND_URL if set, otherwise construct from request or use production default
    let backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
        // In production (Render), use the production API URL
        if (process.env.NODE_ENV === 'production') {
            backendUrl = 'https://memory-palace-api.onrender.com';
        } else {
            // In development, use localhost
            backendUrl = `http://localhost:${process.env.PORT || 5001}`;
        }
    }
    const originalUrl = `${backendUrl}/images/original/${filename}`;
    const optimizedUrl = `${backendUrl}/images/optimized/${filename}`;

    res.json({
        success: true,
        filename,
        originalExists,
        optimizedExists,
        originalUrl,
        optimizedUrl,
        originalSize: originalExists ? fs.statSync(originalPath).size : null,
        optimizedSize: optimizedExists ? fs.statSync(optimizedPath).size : null
    });
};
