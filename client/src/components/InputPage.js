import React, { useState } from 'react';
import axios from 'axios';

const InputPage = () => {
    const [inputText, setInputText] = useState('');
    const [images, setImages] = useState(null);

    const handleInputChange = (e) => {
        setInputText(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/http://localhost:5000/api/generate-images', {
                inputText: inputText
            });
            setImages(response.data.images);
        } catch (error) {
            console.error('Error generating images:', error);
        }
    };

    return (
        <div>
            <h1>Memory Palace Input</h1>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder="Enter your list of items here..."
                />
                <button type="submit">Generate Images</button>
            </form>
            {images && (
                <div>
                    <h2>Generated Images</h2>
                    <div>
                        {images.map((image, index) => (
                            <img key={index} src={image.url} alt={image.prompt} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InputPage;
