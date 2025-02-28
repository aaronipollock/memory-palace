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
        console.log('Received prompt:', prompt);
        console.log('Using API key:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'Not found');

        // Create directory if it doesn't exist
        const imagesDir = path.join(__dirname, '../public/images');
        if (!fs.existsSync(imagesDir)){
            fs.mkdirSync(imagesDir, { recursive: true });
        }

        // For debugging - log the request we're about to make
        console.log('Sending request to Stability AI with data:', {
            text_prompts: [{ text: prompt, weight: 1 }],
            cfg_scale: 7,
            height: 1024,
            width: 1024,
            steps: 30,
            samples: 1
        });

        try {
            // Try to use the Stability AI API
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
        } catch (apiError) {
            console.error('Stability AI API error:', apiError.response ? apiError.response.data : apiError.message);

            // Use a fallback approach - return a URL to an Unsplash image
            // const fallbackImages = {
            //     'sofa': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc',
            //     'painting': 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5',
            //     'coffee table': 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c',
            //     'window': 'https://images.unsplash.com/photo-1592492152545-9695d3f473f4',
            //     'plant': 'https://images.unsplash.com/photo-1463320726281-696a485928c7',
            //     'default': 'https://images.unsplash.com/photo-1579546929662-711aa81148cf'
            // };

            const fallbackUrl = fallbackImages[association.anchor] || fallbackImages['default'];
            console.log('Using fallback image URL:', fallbackUrl);

            res.json({
                success: true,
                imageUrl: fallbackUrl,
                fallback: true
            });
        }
    } catch (error) {
        console.error('Error in generate-image route:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate image'
        });
    }
});

module.exports = router;
