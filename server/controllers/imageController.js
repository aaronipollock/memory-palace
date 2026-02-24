const axios = require('axios');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const AppError = require('../utils/AppError');
require('dotenv').config();

// Stable Diffusion API endpoint
const STABLE_DIFFUSION_API_URL = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';
const API_KEY = process.env.STABILITY_API_KEY;



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
    const { prompt, association } = req.body;

    // Check if API key is configured
    if (!API_KEY) {
        console.warn('STABILITY_API_KEY is not configured. Generating placeholder image.');
        const placeholderImage = generatePlaceholderImage(association);
        return res.json({
            success: true,
            imageData: placeholderImage,
            mimeType: 'image/png',
            filename: `${Date.now()}-${association.anchor}-${association.memorableItem}.png`,
            isPlaceholder: true
        });
    }

    // Enhanced parameters for better tapestry, dais, and anchor point generation
    const isTapestryPrompt = prompt.toLowerCase().includes('tapestry');
    const isDaisPrompt = prompt.toLowerCase().includes('dais');
    const needsEnhancedParams = isTapestryPrompt || isDaisPrompt;
    const cfgScale = needsEnhancedParams ? 8 : 7; // Higher CFG for complex architectural elements
    const steps = needsEnhancedParams ? 35 : 30; // More steps for complex architectural elements

    try {
        console.log('Calling Stability AI API for image generation...');
        // Generate image using Stability AI API
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
                    {
                        "text": prompt,
                        "weight": 1
                    }
                ],
                cfg_scale: cfgScale,
                height: 1024,
                width: 1024,
                steps: steps,
                samples: 1
            },
            timeout: 30000 // 30 second timeout
        });

        // Extract the image data from the response
        const imageData = response.data.artifacts[0];

        // Return base64 data directly without saving to disk
        const responseData = {
            success: true,
            imageData: imageData.base64,
            mimeType: 'image/png',
            filename: `${Date.now()}-${association.anchor}-${association.memorableItem}.png`
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
                isPlaceholder: true
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
