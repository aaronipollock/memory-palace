import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ROOM_TYPES = [
    "living room",
    "bedroom",
    "kitchen",
    "dining room",
    "office",
    "bathroom",
    "study",
    "game room"
];

const InputPage = ({ onImagesGenerated, setIsLoading, isLoading }) => {
    // Initialize state from localStorage or use default values
    const [anchorPoints, setAnchorPoints] = useState(() =>
        localStorage.getItem('anchorPoints') || ''
    );
    const [memorables, setMemorables] = useState(() =>
        localStorage.getItem('memorables') || ''
    );
    const [pairingStrategy, setPairingStrategy] = useState(() =>
        localStorage.getItem('pairingStrategy') || 'sequential'
    );
    const [roomType, setRoomType] = useState(() =>
        localStorage.getItem('roomType') || ''
    );
    const [error, setError] = useState(null);

    // Save to localStorage whenever values change
    useEffect(() => {
        localStorage.setItem('anchorPoints', anchorPoints);
        localStorage.setItem('memorables', memorables);
        localStorage.setItem('pairingStrategy', pairingStrategy);
        localStorage.setItem('roomType', roomType);
    }, [anchorPoints, memorables, pairingStrategy, roomType]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!anchorPoints.trim() || !memorables.trim() || !roomType) {
            setError('Please provide both anchor points and memorables');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('Sending request with:', {
                anchorPoints: anchorPoints.split('\n').map(item => item.trim()).filter(Boolean),
                memorables: memorables.split('\n').map(item => item.trim()).filter(Boolean),
                pairingStrategy,
                roomType
            });

            const response = await axios.post('http://localhost:5000/api/generate-images', {
                anchorPoints: anchorPoints.split('\n').map(item => item.trim()).filter(Boolean),
                memorables: memorables.split('\n').map(item => item.trim()).filter(Boolean),
                pairingStrategy: pairingStrategy,
                roomType: roomType
            });

            console.log('Received response:', response.data);

            if (response.data && response.data.images) {
                console.log('Calling onImagesGenerated with:', response.data.images, roomType);
                onImagesGenerated(response.data.images, roomType);
            } else {
                throw new Error('No images in response');
            }
        } catch (err) {
            console.error('Error details:', {
                message: err.message,
                responseData: err.response?.data,
                status: err.response?.status
            });
            setError(err.response?.data?.error || 'Failed to generate images. Please try again.');
            setIsLoading(false);
        }
    };

    // Add a clear form function
    const handleClear = () => {
        setAnchorPoints('');
        setMemorables('');
        setPairingStrategy('sequential');
        setRoomType('');
        localStorage.clear();
        setError(null);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-primary mb-6 text-center">Create Your Memory Palace</h2>

            <div className="bg-surface rounded-lg p-6 mb-8 text-text">
                <p className="mb-4">To create your memory palace, follow these steps:</p>
                <ol className="list-decimal pl-6 space-y-2">
                    <li><strong className="text-primary">Room Type:</strong> Choose the type of room for your memory palace.</li>
                    <li><strong className="text-primary">Anchor Points:</strong> List features or locations in your space, such as "sofa", "window", or "bookshelf".</li>
                    <li><strong className="text-primary">Memorables:</strong> List the items or concepts you want to remember.</li>
                    <li>Choose a <strong className="text-primary">Pairing Strategy</strong> to determine how your memorables will be associated with anchor points.</li>
                </ol>
                <p className="mt-4">Ensure that each item is on a new line for clarity.</p>
            </div>

            <div className="bg-surface rounded-lg p-4 mb-4">
                <div className="flex items-center gap-4">
                    <label className="text-primary font-medium whitespace-nowrap">Room Type:</label>
                    <select
                        value={roomType}
                        onChange={(e) => setRoomType(e.target.value)}
                        className="flex-1 p-2 border-2 border-primary rounded-lg bg-background text-primary"
                        required
                    >
                        <option value="">Select a room type...</option>
                        {ROOM_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-primary font-medium">
                            Anchor Points (one per line):
                        </label>
                        <textarea
                            value={anchorPoints}
                            onChange={(e) => setAnchorPoints(e.target.value)}
                            placeholder="Example:
sofa
window
bookshelf"
                            disabled={isLoading}
                            className="w-full h-40 bg-background text-text p-3 rounded-lg border border-primary/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-primary font-medium">
                            Memorables (one per line):
                        </label>
                        <textarea
                            value={memorables}
                            onChange={(e) => setMemorables(e.target.value)}
                            placeholder="Example:
grocery list
meeting agenda
historical dates"
                            disabled={isLoading}
                            className="w-full h-40 bg-background text-text p-3 rounded-lg border border-primary/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-primary font-medium">
                        Pairing Strategy:
                    </label>
                    <select
                        value={pairingStrategy}
                        onChange={(e) => setPairingStrategy(e.target.value)}
                        disabled={isLoading}
                        className="w-full bg-background text-text p-3 rounded-lg border border-primary/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <option value="sequential">Sequential</option>
                        <option value="random">Random</option>
                    </select>
                </div>

                <div className="space-y-4">
                    {error && (
                        <div className="text-red-500 text-center">{error}</div>
                    )}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={!anchorPoints.trim() || !memorables.trim() || !roomType}
                            className="flex-1 bg-background text-primary border border-primary py-3 px-6 rounded-lg
                                     hover:bg-primary hover:text-background transition-colors duration-300
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     disabled:hover:bg-background disabled:hover:text-primary"
                        >
                            Generate Associations
                        </button>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="px-6 py-3 bg-red-500 text-white rounded-lg
                                     hover:bg-red-600 transition-colors duration-300"
                        >
                            Clear Form
                        </button>
                    </div>
                </div>
            </form>
            {isLoading && (
                <div className="text-primary text-center mt-4">
                    Creating your memory associations...
                </div>
            )}
        </div>
    );
};

export default InputPage;
