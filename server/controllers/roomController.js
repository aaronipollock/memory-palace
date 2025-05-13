const axios = require('axios');

exports.generateRoom = async (req, res) => {
    const { roomType, anchorPoints } = req.body;

    if (!process.env.OPENAI_API_KEY) {
        console.error('OPENAI_API_KEY is not set');
        return res.status(500).json({ error: 'OpenAI API key is not configured' });
    }

    try {
        console.log('=== Starting Room Generation ===');
        console.log('Room Type:', roomType);
        console.log('Anchor Points:', anchorPoints);

        // Generate room image with DALL-E
        const imagePrompt = `A clear, eye-level view of a ${roomType}, like a sitcom set.
            The room MUST prominently feature these specific items: ${anchorPoints.join(', ')}.
            Each item should be clearly visible and naturally placed.
            Style should be simple and clean, like a 3D rendered room.
            The view should be straight-on, like looking at a TV set.`;

        console.log('Image Prompt:', imagePrompt);

        const response = await axios.post('https://api.openai.com/v1/images/generations', {
            prompt: imagePrompt,
            n: 1,
            size: "1024x1024",
            style: "natural",
            quality: "standard"  // Changed from "hd" to "standard" for faster generation
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 20000  // 20 second timeout
        });

        // Return the image URL and initial positions
        const positions = anchorPoints.map((item, index) => ({
            name: item,
            x: 400,  // Center X
            y: 200 + (index * 100)  // Stacked vertically with spacing
        }));

        console.log('Sending response:', {
            roomImage: response.data.data[0].url,
            positions: positions
        });

        res.json({
            roomImage: response.data.data[0].url,
            positions: positions,
            prompt: imagePrompt
        });

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
