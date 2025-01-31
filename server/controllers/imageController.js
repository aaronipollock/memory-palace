const axios = require('axios');

// Add these helper functions at the top of the file
const shuffleArrays = (arr1, arr2) => {
    const indices = Array.from(arr1.keys());
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices.map(i => [arr1[i], arr2[i]]);
};

const zipArrays = (arr1, arr2) => {
    return arr1.map((item, index) => [item, arr2[index]]);
};

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

const generateAssociationPrompt = (item, roomFeature) => {
    // Make abstract concepts more concrete
    const simplifiedItem = item.toLowerCase().includes('lake') ?
        'waves of water' : item;

    const description = `${item} interacts with the ${roomFeature} in a memorable way`;

    return {
        prompt: `Create a memorable, surreal image that connects ${simplifiedItem} with ${roomFeature}.
        The image should:
        - Show the ${simplifiedItem} physically interacting with or transforming the ${roomFeature}
        - Make the connection obvious and visually clear
        - Use bold colors and simple shapes
        - Keep the composition focused on these two elements
        Style: Clean, digital art with clear details`,
        description: description
    };
};

const generateRoomPrompt = (roomType, anchorPoints) => {
    // Create a numbered list of items for emphasis
    const numberedItems = anchorPoints
        .map((item, index) => `${index + 1}. ${item}`)
        .join(', ');

    return `Create a simplified, diagram-like digital illustration of a ${roomType}.
    THIS IMAGE MUST INCLUDE ALL ${anchorPoints.length} OF THESE ITEMS (no exceptions):
    ${numberedItems}

    CRITICAL REQUIREMENTS:
    - Use a simple, clean digital art style like a textbook diagram
    - Draw the room from a straight-on view, like looking at a stage set
    - Make each item LARGE and CLEARLY VISIBLE
    - Label each item with a small number (1-${anchorPoints.length})
    - Use bright lighting and minimal shadows
    - Avoid any decorative elements that aren't in the list
    - Keep the style simple and focused on the required items
    - Place items with space between them (no overlapping)

    Style: Clean, labeled diagram with clear visibility of all items.

    VERIFICATION CHECKLIST:
    ${anchorPoints.map(item => `□ ${item} is clearly visible and labeled`).join('\n')}

    Note: This is a memory training tool - ALL items must be included and clearly visible.`;
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.generateImages = async (req, res) => {
    const { anchorPoints, memorables, pairingStrategy, roomType } = req.body;

    try {
        const pairs = pairingStrategy === 'random'
            ? shuffleArrays(anchorPoints, memorables)
            : zipArrays(anchorPoints, memorables);

        const associations = [];

        // Generate images in batches of 3 with delays
        for (let i = 0; i < pairs.length; i += 3) {
            const batch = pairs.slice(i, i + 3);

            // Wait 30 seconds between batches
            if (i > 0) {
                await delay(30000);
            }

            const batchResults = await Promise.all(batch.map(async ([roomFeature, item]) => {
                const { prompt, description } = generateAssociationPrompt(item, roomFeature);
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

                return {
                    item,
                    roomFeature,
                    url: response.data.data[0].url,
                    prompt,
                    description
                };
            }));

            associations.push(...batchResults);
        }

        console.log('Generated associations:', associations);
        res.json({ images: associations });
    } catch (error) {
        console.error('Error generating images:', error);
        res.status(500).json({
            error: 'Failed to generate images',
            details: error.response?.data?.error?.message || error.message
        });
    }
};

exports.generateRoom = async (req, res) => {
    const { roomType, anchorPoints } = req.body;
    const maxRetries = 3;
    let currentTry = 0;

    try {
        const prompt = generateRoomPrompt(roomType, anchorPoints);
        console.log('=== Starting Room Generation ===');
        console.log('Room Type:', roomType);
        console.log('Anchor Points:', anchorPoints);

        // Initial delay of 30 seconds to ensure we're past the rate limit window
        await delay(30000);

        while (currentTry < maxRetries) {
            try {
                if (currentTry > 0) {
                    console.log(`Waiting 30 seconds before retry ${currentTry + 1}...`);
                    await delay(30000);
                }

                const response = await axios.post('https://api.openai.com/v1/images/generations', {
                    prompt: prompt,
                    n: 1,
                    size: "1024x1024",
                    style: "natural",
                    quality: "standard"
                }, {
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Room generation successful');
                return res.json({
                    roomImage: response.data.data[0].url,
                    positions: anchorPoints.map((item, index) => ({
                        name: item,
                        x: 400,
                        y: 200 + (index * 100)
                    }))
                });

            } catch (err) {
                currentTry++;
                console.log(`Attempt ${currentTry} failed:`, err.response?.data?.error || err.message);

                if (currentTry === maxRetries || (err.response?.status !== 429 && err.response?.status !== 500)) {
                    throw err;
                }
            }
        }
    } catch (error) {
        console.error('=== Error Details ===');
        console.error('Error type:', error.name);
        console.error('Error message:', error.message);
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);

        res.status(500).json({
            error: 'Failed to generate room layout',
            details: error.response?.data?.error?.message || error.message
        });
    }
};
