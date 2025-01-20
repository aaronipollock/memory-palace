import React, { useState } from 'react';
import axios from 'axios';

const InputPage = ({ onImagesGenerated }) => {
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        setInputText(e.target.value);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post('http://localhost:5000/api/generate-images', {
                inputText: inputText
            });

            console.log('Response:', response.data); // Debug log

            if (response.data && response.data.images) {
                // Pass the generated images up to the parent component
                onImagesGenerated(response.data.images);
                setInputText(''); // Clear the input after successful generation
            } else {
                throw new Error('No images received from the server');
            }
        } catch (err) {
            console.error('Error details:', err);
            setError(err.response?.data?.error || 'Failed to generate images. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="input-container">
            <h2>Create Your Memory Palace</h2>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder="Enter your list of items (one per line)..."
                    disabled={isLoading}
                />
                {error && <div className="error">{error}</div>}
                <button type="submit" disabled={isLoading || !inputText.trim()}>
                    {isLoading ? 'Generating...' : 'Generate Images'}
                </button>
            </form>
            {isLoading && <div className="loading">Generating your images...</div>}
        </div>
    );
};

export default InputPage;
