import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ROOM_ANCHOR_POSITIONS } from '../constants/roomData';
import NavBar from './NavBar';

const ROOM_TYPES = [
    "throne room",
    "bedchamber",
    // "great hall",
    // "chapel",
    "dungeon",
    // "kitchen",
];

// Clear the stored anchor points to ensure our new list is used
localStorage.removeItem('anchorPoints');

const InputPage = ({ onImagesGenerated, setIsLoading, isLoading }) => {
    // Initialize state from localStorage or use default values
    const [roomType, setRoomType] = useState(() =>
        localStorage.getItem('roomType') || 'throne room'
    );
    const [memorables, setMemorables] = useState(() =>
        localStorage.getItem('memorables') || ''
    );
    const [error, setError] = useState(null);

    // Get the anchor points for the current room type
    const currentAnchorPoints = Object.keys(ROOM_ANCHOR_POSITIONS[roomType] || ROOM_ANCHOR_POSITIONS["throne room"]);

    // Save to localStorage whenever values change
    useEffect(() => {
        localStorage.setItem('memorables', memorables);
        localStorage.setItem('roomType', roomType);
    }, [memorables, roomType]);

    // Add console.log to debug
    console.log('onImagesGenerated prop:', onImagesGenerated);
    console.log('Current room type:', roomType);
    console.log('Current anchor points:', currentAnchorPoints);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsLoading(true);
        setError(null);

        try {
            console.log('Sending request with:', {
                anchorPoints: currentAnchorPoints,
                memorables: memorables.split('\n').map(item => item.trim()).filter(Boolean),
                roomType
            });

            const response = await axios.post('http://localhost:5000/api/generate-images', {
                anchorPoints: currentAnchorPoints,
                memorables: memorables.split('\n').map(item => item.trim()).filter(Boolean),
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
        setMemorables('');
        setRoomType('throne room');
        localStorage.clear();
        setError(null);
    };

    const handleProceedToVisualizer = () => {
        const memorablesList = memorables.split('\n')
            .map(item => item.trim())
            .filter(Boolean);

        console.log('Memorables list:', memorablesList);

        // Create associations with anchor points for the current room
        const associations = currentAnchorPoints.map((anchor, index) => {
            const memorableItem = index < memorablesList.length ? memorablesList[index] : '';
            return {
                anchor,
                memorableItem,
                description: `A memorable representation of ${memorableItem} at the ${anchor}`
            };
        });

        console.log('Created associations:', associations);

        // Save the complete palace data to localStorage
        const palaceData = {
            roomType,
            associations
        };
        localStorage.setItem('currentPalace', JSON.stringify(palaceData));

        // Clear any previously accepted images for this new palace
        localStorage.removeItem('acceptedImages');

        onImagesGenerated(associations, roomType);
    };

    return (
        <div className="min-h-screen bg-background">
            <NavBar />
            <div className="container mx-auto px-4 py-8">
                {/* <h1 className="text-3xl font-bold mb-6 text-center">Create Your Memory Palace</h1> */}
        <div className="mario-bg mario-clouds min-h-screen py-12 px-4">
            <div className="max-w-4xl mx-auto mario-castle p-6">
                        <h2 className="mario-header text-2xl mb-8 text-center">CREATE YOUR MEMORY PALACE</h2>

                <div className="bg-white rounded-lg p-6 mb-8 text-text">
                    <p className="mb-4">To create your memory palace, follow these steps:</p>
                    <ol className="list-decimal pl-6 space-y-2">
                        <li><strong className="text-primary">Room Type:</strong> Choose the type of room for your memory palace.</li>
                        <li><strong className="text-primary">Anchor Points:</strong> In Demo Mode, we've chosen these features for you.</li>
                        <li><strong className="text-primary">Memorables:</strong> List the items or concepts you want to remember.</li>
                    </ol>
                </div>

                <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-4">
                        <label className="text-primary font-bold whitespace-nowrap">Room Type:</label>
                        <select
                            value={roomType}
                            onChange={(e) => setRoomType(e.target.value)}
                            className="flex-1 p-2 border-2 border-accent1 rounded-lg bg-white text-text"
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
                                    <label className="block text-white font-bold mb-2">
                                Demo Anchor Points:
                            </label>
                                    <pre
                                        className="border p-3 w-full h-40 bg-white text-text rounded-lg whitespace-pre-wrap leading-tight"
                                        style={{ fontFamily: 'inherit', lineHeight: 1.2, margin: 0 }}
                                    >
                                {currentAnchorPoints.join('\n')}
                            </pre>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-white font-bold">
                                Memorables (one per line):
                            </label>
                            <textarea
                                value={memorables}
                                onChange={(e) => setMemorables(e.target.value)}
                                placeholder=""
                                disabled={isLoading}
                                className="w-full h-40 bg-white text-text p-3 rounded-lg border border-accent1 focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {error && (
                            <div className="text-red-500 text-center bg-white p-2 rounded">{error}</div>
                        )}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                onClick={handleProceedToVisualizer}
                                        className="flex-1 btn-loci text-lg px-8 py-4"
                                        disabled={isLoading}
                                    >
                                        PROCEED TO VISUALIZER
                            </button>
                            <button
                                type="button"
                                onClick={handleClear}
                                disabled={isLoading}
                                className="px-6 py-3 bg-secondary text-white border-2 border-secondary rounded-lg
                                         hover:bg-white hover:text-secondary transition-colors duration-300
                                         disabled:opacity-50 disabled:cursor-not-allowed btn-mario"
                            >
                                CLEAR FORM
                            </button>
                        </div>
                    </div>
                </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InputPage;
