const axios = require('axios');

exports.generateImages = async (req, res) => {
    const { roomFeatures, itemsToRemember } = req.body; //Get the input text from the request body
    console.log('Room Features:', roomFeatures);
    console.log('Items to Remember:', itemsToRemember)

    // Split inputText into an array of items

    try {
        // Validate inputs
        if (!Array.isArray(roomFeatures) || !Array.isArray(itemsToRemember)) {
            return res.status(400).json({ error: 'Both room features and items must be provided as arrays'});
        }

        if (roomFeatures.length === 0 || itemsToRemember.length == 0) {
            return res.status(400).json({ error: 'Both lists must contain at least one item' });
        }

        // For MVP, we'll pair items sequentially
        // Later this could be enhanced with more sophisticated matching
        const pairs = itemsToRemember.map((item, index) => {
            const roomFeature = roomFeatures[index % roomFeatures.length];
            return {
                item,
                roomFeature,
                // Create a dramatic/humorous scenario
                prompt: `A dramatic and memorable scene where ${item} is interacting with ${roomFeature} in a surprising and attention-grabbing way, digital art style`
            }
        })

        const generatedImages = [];

        // Generate an image for each pair
        for (const pair of pairs) {
            const response = await axios.post('https://api.openai.com/v1/images/generations', {
                prompt: pair.prompt,
                n: 1, //Number of images to generate
                size: "1024x1024" // Size of the generated image
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            generatedImages.push({
                item: pair.item,
                roomFeature: pair.roomFeature,
                prompt: pair.prompt,
                url: response.data.data[0].url
            });
        }

        // Send the generated image URLs back to the client
        res.json({ images: generatedImages });
    } catch (error) {
        console.error('Error details:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Failed to generate images',
            details: error.response?.data?.error?.message || error.message
        });
    }
};
