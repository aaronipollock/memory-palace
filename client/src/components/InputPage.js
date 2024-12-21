import React, { useState } from 'react';
import axios from 'axios';

const InputPage = () => {
    const [inputText, setInputText] = useState('');
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async () => {
        // Process input and call the AI API
        const response = await axios.post('/api/generate-images', { inputText });
        // Handle response and navigate to gallery
    };

    return (
        <div>
            <h2>Input Your Items</h2>
            <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} />
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleSubmit}>Process List</button>
        </div>
    );
};

export default InputPage;
