import React, { useState } from 'react';
import axios from 'axios';

const InputPage = ({ onImagesGenerated }) => {
    // Initialize state with empty strings
    const [roomFeatures, setRoomFeatures] = useState('');
    const [itemsToRemember, setItemsToRemember] = useState('');
    const [pairingStrategy, setPairingStrategy] = useState('sequential'); // Default strategy
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate that both inputs have content
        if (!roomFeatures.trim() || !itemsToRemember.trim()) {
            setError('Please provide both room features and items to remember');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post('http://localhost:5000/api/generate-images', {
                roomFeatures: roomFeatures.split('\n').map(item => item.trim()).filter(Boolean),
                itemsToRemember: itemsToRemember.split('\n').map(item => item.trim()).filter(Boolean),
                pairingStrategy: pairingStrategy
            });

            if (response.data && response.data.images) {
                onImagesGenerated(response.data.images);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to generate images. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="input-container">
            <h2>Create Your Memory Palace</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="input-group">
                        <label>Room Features (one per line):</label>
                        <textarea
                            value={roomFeatures}
                            onChange={(e) => setRoomFeatures(e.target.value)}
                            placeholder="Example:
wall
sofa
tree outside window
mirror
fireplace"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="input-group">
                        <label>Items to Remember (one per line):</label>
                        <textarea
                            value={itemsToRemember}
                            onChange={(e) => setItemsToRemember(e.target.value)}
                            placeholder="Example:
gun
knife
monkey
beach ball"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className='form-group'>
                    <label>Pairing Strategy:</label>
                    <select
                        value={pairingStrategy}
                        onChange={(e) => setPairingStrategy(e.target.value)}
                        disabled={isLoading}
                    >
                        <option value="sequential">Sequential</option>
                        <option value="random">Random</option>
                    </select>
                </div>

                <div className="form-actions">
                    {error && <div className="error">{error}</div>}
                    <button
                        type="submit"
                        disabled={isLoading || !roomFeatures.trim() || !itemsToRemember.trim()}
                    >
                        {isLoading ? 'Generating...' : 'Generate Associations'}
                    </button>
                </div>
            </form>
            {isLoading && <div className="loading">Creating your memory associations...</div>}
        </div>
    );
};

export default InputPage;
