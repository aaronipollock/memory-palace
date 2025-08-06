const axios = require('axios');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
require('dotenv').config();

// Stable Diffusion API endpoint
const STABLE_DIFFUSION_API_URL = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';
const API_KEY = process.env.STABILITY_API_KEY;

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
    try {
        const { prompt, association } = req.body;
        console.log('Received prompt:', prompt);
        console.log('Using API key:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'Not found');

        console.log('Sending request to Stability AI with data:', {
            text_prompts: [{ text: prompt, weight: 1 }],
            cfg_scale: 7,
            height: 1024,
            width: 1024,
            steps: 30,
            samples: 1
        });

        try {
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
                    cfg_scale: 7,
                    height: 1024,
                    width: 1024,
                    steps: 30,
                    samples: 1
                }
            });

            // Extract the image data from the response
            const imageData = response.data.artifacts[0];

            // Return base64 data directly without saving to disk
            res.json({
                success: true,
                imageData: imageData.base64,
                mimeType: 'image/png',
                filename: `${Date.now()}-${association.anchor}-${association.memorableItem}.png`
            });

        } catch (apiError) {
            console.error('Stability AI API error:', apiError.response ? apiError.response.data : apiError.message);

            res.status(500).json({
                success: false,
                error: apiError.message || 'Failed to generate image with Stability AI'
            });
        }
    } catch (error) {
        console.error('Error in generateImages:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate image'
        });
    }
};

// Upload and optimize an existing image
exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const { originalDir, optimizedDir } = ensureDirectories();

        const originalPath = path.join(originalDir, req.file.filename);
        const optimizedPath = path.join(optimizedDir, req.file.filename);

        // Move uploaded file to original directory
        fs.renameSync(req.file.path, originalPath);

        // Generate optimized version
        const optimizationSuccess = await generateOptimizedImage(originalPath, optimizedPath);

        // Construct URLs
        const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`;
        const originalUrl = `${backendUrl}/images/original/${req.file.filename}`;
        const optimizedUrl = `${backendUrl}/images/optimized/${req.file.filename}`;

        res.json({
            success: true,
            originalUrl,
            optimizedUrl,
            optimizationSuccess,
            filename: req.file.filename
        });

    } catch (error) {
        console.error('Error in uploadImage:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to upload image'
        });
    }
};

// Get image info (for debugging)
exports.getImageInfo = async (req, res) => {
    try {
        const { filename } = req.params;
        const { originalDir, optimizedDir } = ensureDirectories();

        const originalPath = path.join(originalDir, filename);
        const optimizedPath = path.join(optimizedDir, filename);

        const originalExists = fs.existsSync(originalPath);
        const optimizedExists = fs.existsSync(optimizedPath);

        const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`;
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

    } catch (error) {
        console.error('Error in getImageInfo:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get image info'
        });
    }
};
