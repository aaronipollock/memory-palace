const axios = require('axios');

exports.generateImages = async (req, res) => {
    const { inputText } = req.body; //Get the input text from the request body
    console.log('Input Text:', inputText);

    // Split inputText into an array of items
    const items = inputText.split('\n').map(item => item.trim()).filter(item => item);

    try {
        // Prepare an array to hold the generated image URLs
        const imageUrls = [];

        // Loop through each item and call the OpenAI API
        for (const item of items) {
            const response = await axios.post('https://api.openai.com/v1/images/generations', {
                prompt: item,
                n: 1, //Number of images to generate
                size: "1024x1024" // Size of the generated image
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            // Extract the image URL from the response
            const imageUrl = response.data.data[0].url;
            imageUrls.push({ prompts: item, url: imageUrl });
        }

        // Send the generated image URLs back to the client
        res.json({ images: imageUrls });
    } catch (error) {
        console.error('Error generating images:', error.response ? error.response.data : error.message);

        if (error.response && error.response.data.error.code === 'billing_hard_limit_reached') {
            return res.status(402).json({ error: 'Billing limit reached. Please check your account.'})
        }

        res.status(500).json({ error: 'Failed to generate images' });
    }
};
