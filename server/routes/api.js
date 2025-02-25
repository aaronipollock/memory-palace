const express = require('express');
const imageController = require('../controllers/imageController');
const roomController = require('../controllers/roomController');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

// Stable Diffusion API endpoint
const STABLE_DIFFUSION_API_URL = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';
const API_KEY = process.env.STABILITY_API_KEY;

router.post('/generate-images', imageController.generateImages);
router.post('/generate-room', roomController.generateRoom);

router.post('/generate-image', async (req, res) => {
    try {
        const { prompt, association } = req.body;

        // Create directory if it doesn't exist
        const imagesDir = path.join(__dirname, '../public/images');
        if (!fs.existsSync(imagesDir)){
            fs.mkdirSync(imagesDir, { recursive: true });
        }

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

        // Convert the base64 image to a Buffer
        const buffer = Buffer.from(imageData.base64, 'base64');

        // Use path.join for creating the file path
        const filename = `${Date.now()}-${association.anchor}-${association.memorable}.png`;
        const filePath = path.join(imagesDir, filename);

        fs.writeFileSync(filePath, buffer);

        // Remove 'api' from the path since we're serving directly from 'public'
        res.json({
            success: true,
            imageUrl: `/public/images/${filename}`
        });

    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate image'
        });
    }
});

module.exports = router;
