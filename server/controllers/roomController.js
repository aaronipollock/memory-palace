const axios = require('axios');
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateRoomPrompt = (roomType, anchorPoints) => {
    const itemList = anchorPoints.map((item, index) =>
        `${index + 1}. A clear, detailed ${item} in high definition`
    ).join('\n');

    return `Create a clean, high-quality digital illustration showing these ${anchorPoints.length} objects in a ${roomType}:

${itemList}

Important: This is a memory training tool.
- Draw each object in crisp, clear detail
- Make objects large and easy to identify
- Use bright lighting and sharp definition
- Add the ${roomType} setting around the objects
- View: straight-on, well-lit perspective`;
};

exports.generateRoom = async (req, res) => {
    const { roomType, anchorPoints } = req.body;
    const maxRetries = 3;
    let currentTry = 0;

    if (!process.env.OPENAI_API_KEY) {
        console.error('OPENAI_API_KEY is not set');
        return res.status(500).json({ error: 'OpenAI API key is not configured' });
    }

    try {
        const prompt = generateRoomPrompt(roomType, anchorPoints);
        console.log('=== Starting Room Generation ===');
        console.log('Room Type:', roomType);
        console.log('Anchor Points:', anchorPoints);
        console.log('Image Prompt:', prompt);

        // Initial delay to handle rate limit after associations
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
                    prompt: prompt  // Include prompt in response for debugging
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
