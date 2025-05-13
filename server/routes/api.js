const express = require('express');
const imageController = require('../controllers/imageController');
const roomController = require('../controllers/roomController');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const embeddingService = require('../services/embeddingService');

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

            // Handle the error appropriately
            res.status(500).json({
                success: false,
                error: apiError.message || 'Failed to generate image with Stability AI'
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

// Improved word concreteness endpoint with better error handling
router.get('/word-concreteness/:word', async (req, res) => {
    try {
        const word = req.params.word;

        console.log(`Processing word concreteness request for: "${word}"`);

        // Check if API key exists
        if (!process.env.REACT_APP_RAPID_API_KEY) {
            console.error('Missing WordsAPI key');
            // Return a default response instead of an error
            return res.json({ isConcrete: true });
        }

        try {
            const response = await axios.get(`https://wordsapiv1.p.rapidapi.com/words/${word}`, {
                headers: {
                    'X-RapidAPI-Key': process.env.REACT_APP_RAPID_API_KEY,
                    'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
                }
            });

            const data = response.data;

            // Enhanced concreteness detection with detailed logging

            // 1. Check if it's a noun
            const isNoun = data.results?.some(result => result.partOfSpeech === 'noun');
            console.log(`Is "${word}" a noun?`, isNoun);

            if (!isNoun) {
                console.log(`"${word}" is not a noun, returning isConcrete: false`);
                return res.json({ isConcrete: false });
            }

            // 2. Check for concrete indicators in definitions and relationships
            const concretePatterns = ['object', 'physical', 'material', 'substance', 'item', 'food', 'device', 'tool', 'fruit', 'plant'];
            const abstractPatterns = ['concept', 'idea', 'feeling', 'state', 'quality', 'condition', 'process', 'abstract'];

            let concreteScore = 0;
            let abstractScore = 0;

            // 3. Check for specific categories that are always concrete
            const alwaysConcreteCategories = ['food', 'fruit', 'vegetable', 'animal', 'plant', 'object', 'tool'];

            // If the word itself is in our always concrete list, it's concrete
            if (alwaysConcreteCategories.includes(word.toLowerCase())) {
                console.log(`"${word}" is in alwaysConcreteCategories list, returning isConcrete: true`);
                return res.json({ isConcrete: true });
            }

            // 4. Check typeOf relationships (very useful for concrete objects)
            let isTypeOfConcrete = false;
            let typeOfRelationships = [];

            data.results?.forEach(result => {
                if (result.typeOf) {
                    typeOfRelationships = [...typeOfRelationships, ...result.typeOf];
                    result.typeOf.forEach(type => {
                        const lowerType = type.toLowerCase();
                        if (alwaysConcreteCategories.some(category => lowerType.includes(category))) {
                            isTypeOfConcrete = true;
                            concreteScore += 5; // Give strong weight to typeOf relationships
                            console.log(`Found concrete typeOf relationship: "${type}", adding 5 to concreteScore`);
                        }
                    });
                }
            });

            console.log(`typeOf relationships for "${word}":`, typeOfRelationships);
            console.log(`isTypeOfConcrete:`, isTypeOfConcrete);

            // If it's directly a type of a concrete category, it's concrete
            if (isTypeOfConcrete) {
                console.log(`"${word}" has concrete typeOf relationship, returning isConcrete: true`);
                return res.json({ isConcrete: true });
            }

            // 5. Analyze definitions
            data.results?.forEach(result => {
                if (result.definition) {
                    const defText = result.definition.toLowerCase();
                    console.log(`Analyzing definition: "${defText}"`);

                    concretePatterns.forEach(pattern => {
                        if (defText.includes(pattern)) {
                            concreteScore++;
                            console.log(`Found concrete pattern "${pattern}" in definition, concreteScore now: ${concreteScore}`);
                        }
                    });

                    abstractPatterns.forEach(pattern => {
                        if (defText.includes(pattern)) {
                            abstractScore++;
                            console.log(`Found abstract pattern "${pattern}" in definition, abstractScore now: ${abstractScore}`);
                        }
                    });
                }
            });

            // 6. Check for hasCategories
            let hasCategories = [];
            data.results?.forEach(result => {
                if (result.hasCategories) {
                    hasCategories = [...hasCategories, ...result.hasCategories];
                    result.hasCategories.forEach(category => {
                        const lowerCategory = category.toLowerCase();
                        if (alwaysConcreteCategories.some(concreteCategory => lowerCategory.includes(concreteCategory))) {
                            concreteScore += 3;
                            console.log(`Found concrete hasCategory "${category}", adding 3 to concreteScore`);
                        }
                    });
                }
            });

            console.log(`hasCategories for "${word}":`, hasCategories);

            // 7. Check for inCategory
            let inCategories = [];
            data.results?.forEach(result => {
                if (result.inCategory) {
                    inCategories = [...inCategories, ...result.inCategory];
                    result.inCategory.forEach(category => {
                        const lowerCategory = category.toLowerCase();
                        if (alwaysConcreteCategories.some(concreteCategory => lowerCategory.includes(concreteCategory))) {
                            concreteScore += 3;
                            console.log(`Found concrete inCategory "${category}", adding 3 to concreteScore`);
                        }
                    });
                }
            });

            console.log(`inCategories for "${word}":`, inCategories);

            // 8. Special case for common concrete nouns that might be missed
            const commonConcreteNouns = ['apple', 'banana', 'car', 'house', 'book', 'tree', 'dog', 'cat', 'chair', 'table', 'marshmallow', 'marshmallows', 'broccoli', 'steak'];
            if (commonConcreteNouns.includes(word.toLowerCase())) {
                concreteScore += 5;
                console.log(`"${word}" is in commonConcreteNouns list, adding 5 to concreteScore`);
            }

            // Log the final scores
            console.log(`Final concreteness analysis for "${word}": Concrete score: ${concreteScore}, Abstract score: ${abstractScore}`);

            // Determine if concrete based on scores
            const isConcrete = concreteScore > abstractScore;
            console.log(`Final determination for "${word}": isConcrete = ${isConcrete}`);

            return res.json({ isConcrete });
        } catch (error) {
            console.error('WordsAPI error:', error.message);

            // For common food items, default to concrete
            const commonFoods = ['broccoli', 'steak', 'apple', 'banana', 'orange', 'carrot'];
            if (commonFoods.includes(word.toLowerCase())) {
                console.log(`"${word}" is a common food, defaulting to isConcrete: true`);
                return res.json({ isConcrete: true });
            }

            // Default to concrete for short words (likely to be concrete)
            if (word.length <= 5) {
                console.log(`"${word}" is a short word, defaulting to isConcrete: true`);
                return res.json({ isConcrete: true });
            }

            // Default response for other cases
            return res.json({ isConcrete: false });
        }
    } catch (error) {
        console.error('Server error in word concreteness endpoint:', error);
        // Return a default response instead of an error
        return res.json({ isConcrete: true });
    }
});

// Endpoint to find similar words
router.get('/similar-words/:word', async (req, res) => {
  try {
    const word = req.params.word;
    const candidates = req.query.candidates ? req.query.candidates.split(',') : [];
    const count = parseInt(req.query.count) || 5;

    if (!candidates || candidates.length === 0) {
      return res.status(400).json({ error: 'No candidate words provided' });
    }

    const similarWords = await embeddingService.findSimilarWords(word, candidates, count);
    return res.json({ similarWords });
  } catch (error) {
    console.error('Similar words API error:', error);
    return res.status(500).json({ error: 'Failed to find similar words' });
  }
});

// Endpoint to generate figurative associations
router.get('/figurative-association/:term', async (req, res) => {
  try {
    const term = req.params.term;
    const association = await embeddingService.generateFigurativeAssociation(term);
    return res.json({ association });
  } catch (error) {
    console.error('Figurative association API error:', error);
    return res.status(500).json({ error: 'Failed to generate figurative association' });
  }
});

module.exports = router;
