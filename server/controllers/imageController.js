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

// Function to pair items with room features
const pairItemsWithFeatures = (items, features, strategy = 'sequential') => {
    const pairs = [];
    const featureCount = features.length;

    switch (strategy) {
        case 'random':
            items.forEach(item => {
                const randomFeature = features[Math.floor(Math.random() * featureCount)];
                pairs.push({ item, roomFeature: randomFeature });
            });
            break;
        case 'sequential':
        default:
            items.forEach((item, index) => {
                const roomFeature = features[index % featureCount];
                pairs.push({ item, roomFeature });
            });
            break;
    }

    return pairs;
}

exports.generateImages = async (req, res) => {
    const { anchorPoints, memorables, pairingStrategy } = req.body;
    console.log('Received data:', { anchorPoints, memorables, pairingStrategy });

    try {
        // Validate inputs
        if (!Array.isArray(anchorPoints) || !Array.isArray(memorables)) {
            return res.status(400).json({ error: 'Both room features and items must be provided as arrays' });
        }

        if (anchorPoints.length === 0 || memorables.length === 0) {
            return res.status(400).json({ error: 'Both lists must contain at least one item' });
        }

        const pairs = pairItemsWithFeatures(memorables, anchorPoints, pairingStrategy);

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

        res.json({ images: generatedImages });
    } catch (error) {
        console.error('Error details:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Failed to generate images',
            details: error.response?.data?.error?.message || error.message
        });
    }
};
