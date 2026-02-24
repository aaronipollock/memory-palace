const axios = require('axios');
const AppError = require('../utils/AppError');

exports.generateRoom = async (req, res) => {
    const { roomType, anchorPoints } = req.body;

    if (!process.env.OPENAI_API_KEY) {
        throw new AppError('OpenAI API key is not configured', 500);
    }

    // Generate room image with DALL-E
    const imagePrompt = `A clear, eye-level view of a ${roomType}, like a sitcom set.
        The room MUST prominently feature these specific items: ${anchorPoints.join(', ')}.
        Each item should be clearly visible and naturally placed.
        Style should be simple and clean, like a 3D rendered room.
        The view should be straight-on, like looking at a TV set.`;

    try {
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

        res.json({
            roomImage: response.data.data[0].url,
            positions: positions,
            prompt: imagePrompt
        });

    } catch (apiError) {
        const errorStatus = apiError.response?.status;

        // Map upstream errors to appropriate status codes
        if (errorStatus === 429) {
            throw new AppError('Room generation service rate limit exceeded', 429, { provider: 'OpenAI' });
        }
        if (apiError.code === 'ECONNABORTED' || apiError.code === 'ETIMEDOUT') {
            throw new AppError('Room generation service timeout', 504, { provider: 'OpenAI' });
        }
        if (errorStatus === 401 || errorStatus === 403) {
            throw new AppError('Room generation service authentication failed', 502, { provider: 'OpenAI' });
        }

        // Generic upstream error
        throw new AppError('Room generation service failed', 502, {
            provider: 'OpenAI',
            status: errorStatus,
            message: apiError.response?.data?.error?.message || apiError.message
        });
    }
};
