import React, { useState } from 'react';
import axios from 'axios';

const InputPage = ({ onImagesGenerated, setIsLoading, isLoading }) => {
    // Initialize state with empty strings
    const [anchorPoints, setAnchorPoints] = useState('');
    const [memorables, setMemorables] = useState('');
    const [pairingStrategy, setPairingStrategy] = useState('sequential'); // Default strategy
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!anchorPoints.trim() || !memorables.trim()) {
            setError('Please provide both anchor points and memorables');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post('http://localhost:5000/api/generate-images', {
                anchorPoints: anchorPoints.split('\n').map(item => item.trim()).filter(Boolean),
                memorables: memorables.split('\n').map(item => item.trim()).filter(Boolean),
                pairingStrategy: pairingStrategy
            });

            if (response.data && response.data.images) {
                onImagesGenerated(response.data.images);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to generate images. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="input-container">
            <h2>Create Your Memory Palace</h2>
            <div className="instructions">
                <p>To create your memory palace, follow these steps:</p>
                <ol>
                    <li><strong>Anchor Points:</strong> List features or locations in your space, such as "sofa", "window", or "bookshelf". These will serve as reference points for your memory associations.</li>
                    <li><strong>Memorables:</strong> List the items or concepts you want to remember, such as "grocery list", "meeting agenda", or "historical dates".</li>
                    <li>Choose a <strong>Pairing Strategy</strong> to determine how your memorables will be associated with anchor points.</li>
                </ol>
                <p>Ensure that each item is on a new line for clarity.</p>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="input-group">
                        <label>Anchor Points (one per line):</label>
                        <textarea
                            value={anchorPoints}
                            onChange={(e) => setAnchorPoints(e.target.value)}
                            placeholder="Example:
sofa
window
bookshelf"
                            disabled={setIsLoading}
                        />
                    </div>

                    <div className="input-group">
                        <label>Memorables (one per line):</label>
                        <textarea
                            value={memorables}
                            onChange={(e) => setMemorables(e.target.value)}
                            placeholder="Example:
grocery list
meeting agenda
historical dates"
                            disabled={setIsLoading}
                        />
                    </div>
                </div>

                <div className='form-group'>
                    <label>Pairing Strategy:</label>
                    <select
                        value={pairingStrategy}
                        onChange={(e) => setPairingStrategy(e.target.value)}
                        disabled={setIsLoading}
                    >
                        <option value="sequential">Sequential</option>
                        <option value="random">Random</option>
                    </select>
                </div>

                <div className="form-actions">
                    {error && <div className="error">{error}</div>}
                    <button
                        type="submit"
                        disabled={setIsLoading || !anchorPoints.trim() || !memorables.trim()}
                    >
                        Generate Associations
                    </button>
                </div>
            </form>
            {isLoading && <div className="loading">Creating your memory associations...</div>}
        </div>
    );
};

export default InputPage;
