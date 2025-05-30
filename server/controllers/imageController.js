const axios = require('axios');

// Helper function to create memorable associations
const createAssociation = (item, roomFeature) => {
    // List of action verbs to make scenes more dynamic
    const actionVerbs = [
        'dramatically interacts with',
        'unexpectedly appears in',
        'humorously transforms',
        'explosively emerges from',
        'magically floats around',
        'chaotically disrupts',
        'mysteriously merges with',
        'playfully bounces off',
        'dramatically crashes into',
        'comically slides down'
    ];

    // List of descriptive adjectives to enhance visualization
    const adjectives = [
        'giant', 'tiny', 'glowing', 'colorful',
        'transparent', 'neon', 'sparkling', 'animated',
        'surreal', 'vibrant'
    ];

    // Randomly select elements to create variety
    const verb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];

    // Create a dramatic/humorous scenario
    return `A ${adjective} ${item} ${verb} the ${roomFeature}, creating a memorable and surprising scene, digital art style`;
};


exports.generateImages = async (req, res) => {
    const { anchorPoints, memorables } = req.body;
    console.log('Received data:', { anchorPoints, memorables});

    try {
        // Validate inputs
        if (!Array.isArray(anchorPoints) || !Array.isArray(memorables)) {
            return res.status(400).json({ error: 'Both room features and items must be provided as arrays' });
        }

        if (anchorPoints.length === 0 || memorables.length === 0) {
            return res.status(400).json({ error: 'Both lists must contain at least one item' });
        }

        const pairs = pairItemsWithFeatures(memorables, anchorPoints);

        // Create associations and generate images
        const generatedImages = [];
        for (const pair of pairs) {
            const prompt = createAssociation(pair.item, pair.roomFeature);

            const response = await axios.post('https://api.openai.com/v1/images/generations', {
                prompt: prompt,
                n: 1,
                size: "1024x1024"
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            generatedImages.push({
                item: pair.item,
                roomFeature: pair.roomFeature,
                prompt: prompt,
                url: response.data.data[0].url
            });
        }

        console.log('Sending response:', {
            images: generatedImages
        });

        res.json({
            images: generatedImages
        });
    } catch (error) {
        console.error('Error details:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Failed to generate images',
            details: error.response?.data?.error?.message || error.message
        });
    }
};
