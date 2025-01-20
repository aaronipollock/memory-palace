const axios = require('axios');

exports.generateImages = async (req, res) => {
    const { inputText } = req.body; //Get the input text from the request body
    console.log('Input Text:', inputText);
    console.log('API Key check in controller:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing')

    // Split inputText into an array of items

    try {
        // Prepare an array to hold the generated image URLs
        const prompts = inputText.split('\n').map(item => item.trim()).filter(item => item);
        const generatedImages = [];

        // Loop through each item and call the OpenAI API
        for (const prompt of prompts) {
            const response = await axios.post('https://api.openai.com/v1/images/generations', {
                prompt: prompt,
                n: 1, //Number of images to generate
                size: "1024x1024" // Size of the generated image
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            generatedImages.push({
                prompt: prompt,
                url: response.data.data[0].url
            });
        }

        // Send the generated image URLs back to the client
        res.json({ images: generatedImages });
    } catch (error) {
        console.error('Error generating images:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Failed to generate images',
            details: error.response?.data?.error?.message || error.message
        });
    }
};
