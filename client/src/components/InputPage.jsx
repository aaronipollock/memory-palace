import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROOM_ANCHOR_POSITIONS } from '../constants/roomData';
import NavBar from './NavBar';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { getContextualErrorMessage } from '../utils/errorHandler';
import { useToast } from '../context/ToastContext';
import { SecureAPIClient } from '../utils/security';
import { getApiUrl } from '../config/api';

const apiClient = new SecureAPIClient(getApiUrl(''));

const ROOM_TYPES = [
    "throne room",
    "bedchamber",
    "dungeon",
];

const ART_STYLES = [
    "Random",
    "Digital Art",
    "Cartoon",
    "3D Render",
    "Watercolor",
    "Pop Art",
    "Photorealistic"
];



const InputPage = ({ setIsLoading, isLoading }) => {
    const navigate = useNavigate();
    // Initialize state from localStorage or use default values
    const [roomType, setRoomType] = useState(() =>
        localStorage.getItem('roomType') || 'throne room'
    );
    const [customRoomId, setCustomRoomId] = useState(null);
    const [customRooms, setCustomRooms] = useState([]);
    const [selectedCustomRoom, setSelectedCustomRoom] = useState(null);
    const [memorables, setMemorables] = useState('');
    const [artStyle, setArtStyle] = useState(() =>
        localStorage.getItem('artStyle') || 'Random'
    );
    const [error, setError] = useState(null);
    const { showSuccess, showInfo } = useToast();

    // Fetch custom rooms on mount
    useEffect(() => {
        const fetchCustomRooms = async () => {
            try {
                const response = await apiClient.get('/api/custom-rooms');
                if (response.ok) {
                    const data = await response.json();
                    setCustomRooms(data);
                }
            } catch (err) {
                console.error('Error fetching custom rooms:', err);
            }
        };
        fetchCustomRooms();
    }, []);

    // Get the anchor points for the current room type
    // If a custom room is selected, use its anchor points
    const currentAnchorPoints = selectedCustomRoom && selectedCustomRoom.anchorPoints
        ? selectedCustomRoom.anchorPoints.map(ap => ap.name)
        : Object.keys(ROOM_ANCHOR_POSITIONS[roomType] || ROOM_ANCHOR_POSITIONS["throne room"]);

    // Handle room type change
    const handleRoomTypeChange = (e) => {
        const value = e.target.value;

        // Check if it's a custom room (format: "custom:roomId")
        if (value.startsWith('custom:')) {
            const roomId = value.replace('custom:', '');
            const customRoom = customRooms.find(r => r._id === roomId);
            if (customRoom) {
                setSelectedCustomRoom(customRoom);
                setCustomRoomId(roomId);
                setRoomType('custom');
            }
        } else {
            // Standard room type
            setSelectedCustomRoom(null);
            setCustomRoomId(null);
            setRoomType(value);
        }
    };

    // Save to localStorage whenever values change
    useEffect(() => {
        localStorage.setItem('roomType', roomType);
        localStorage.setItem('artStyle', artStyle);
        if (customRoomId) {
            localStorage.setItem('customRoomId', customRoomId);
        } else {
            localStorage.removeItem('customRoomId');
        }
    }, [roomType, artStyle, customRoomId]);

    const handleProceedToVisualizer = async () => {
        const memorablesList = memorables.split('\n')
            .map(item => item.trim())
            .filter(Boolean);

        if (memorablesList.length === 0) {
            showInfo('Please add some memorable items before proceeding.');
            return;
        }

        // Create associations with anchor points for the current room
        const associations = currentAnchorPoints.map((anchor, index) => {
            const memorableItem = index < memorablesList.length ? memorablesList[index] : '';
            return {
                anchor,
                memorableItem,
                description: `A memorable representation of ${memorableItem} at the ${anchor}`
            };
        });

        // Save the complete palace data to localStorage
        const palaceData = {
            roomType,
            associations,
            artStyle,
            customRoomId: customRoomId || null,
            customRoomImageUrl: selectedCustomRoom?.imageUrl || null
        };
        localStorage.setItem('currentPalace', JSON.stringify(palaceData));

        // Clear any previously accepted images for this new palace
        localStorage.removeItem('acceptedImages');
        localStorage.removeItem('imageMetadata');

        showSuccess('Memory palace created! Click on the highlighted areas to generate images.');

        // Navigate to visualizer - images will be generated on-demand when users click anchors
        navigate('/visualizer');
    };

    const handleClear = () => {
        setMemorables('');
        setRoomType('throne room');
        setArtStyle('Random');
        localStorage.clear();
        setError(null);
        showSuccess('Form cleared successfully!');
    };

    const handleRetry = () => {
        setError(null);
        handleProceedToVisualizer();
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#2B4C7E]/60 via-[#2B4C7E]/30 to-white">
            <NavBar />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto bg-white/90 p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-8 text-center text-primary">CREATE YOUR MEMORY PALACE</h2>

                    <div className="bg-white rounded-lg p-6 mb-8 text-text">
                        <p className="mb-4">To create your memory palace, follow these steps:</p>
                        <ol className="list-decimal pl-6 space-y-2">
                            <li><strong className="text-primary">Room Type:</strong> Choose the type of room for your memory palace.</li>
                            <li><strong className="text-primary">Art Style:</strong> Select your preferred art style for the generated images.</li>
                            <li><strong className="text-primary">Anchor Points:</strong> In Demo Mode, we've chosen these features for you.</li>
                            <li><strong className="text-primary">Memorables:</strong> List the items or concepts you want to remember.</li>
                        </ol>
                    </div>

                    <div className="bg-white rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-4">
                            <label htmlFor="room-type" className="text-primary font-bold whitespace-nowrap">Room Type:</label>
                            <select
                                id="room-type"
                                value={customRoomId ? `custom:${customRoomId}` : roomType}
                                onChange={handleRoomTypeChange}
                                className="flex-1 p-2 border-2 border-accent1 rounded-lg bg-white text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent1"
                                style={{ maxWidth: '100%' }}
                                required
                                aria-describedby="room-type-help"
                            >
                                <option value="">Select a room type...</option>
                                {/* Standard room types */}
                                {ROOM_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </option>
                                ))}
                                {/* Custom rooms */}
                                {customRooms.length > 0 && (
                                    <optgroup label="Custom Rooms">
                                        {customRooms.map((room) => {
                                            const maxLength = 50;
                                            const displayName = room.name.length > maxLength
                                                ? `${room.name.substring(0, maxLength)}...`
                                                : room.name;
                                            return (
                                                <option key={room._id} value={`custom:${room._id}`}>
                                                    {displayName} ({room.anchorPoints?.length || 0} anchors)
                                                </option>
                                            );
                                        })}
                                    </optgroup>
                                )}
                            </select>
                        </div>
                        <div id="room-type-help" className="sr-only">
                            Choose the type of room for your memory palace. Each room has different anchor points for placing your memories.
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-4">
                            <label htmlFor="art-style" className="text-primary font-bold whitespace-nowrap">Art Style:</label>
                            <select
                                id="art-style"
                                value={artStyle}
                                onChange={(e) => setArtStyle(e.target.value)}
                                className="flex-1 p-2 border-2 border-accent1 rounded-lg bg-white text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent1"
                                required
                                aria-describedby="art-style-help"
                            >
                                {ART_STYLES.map((style) => (
                                    <option key={style} value={style}>{style}</option>
                                ))}
                            </select>
                        </div>
                        <div id="art-style-help" className="sr-only">
                            Select your preferred visual style for the generated images. This will affect how your memorable items are represented.
                        </div>
                    </div>

                    {/* Tip Box */}
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-2 rounded" role="alert" aria-live="polite">
                        <strong>Tip for Memorables:</strong> When entering your memorables below, use concrete, visual words (like "apple," "car," or "envelope") for best results.<br />
                        <br />
                        For <i>abstract ideas</i> or <i>proper nouns</i>, use a concrete image followed by the original term in parentheses.<br />
                        Examples: "hourglass (time)", "two-dollar bill (Thomas Jefferson)", "eagle (freedom)", "scales (justice)"
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="anchor-points" className="block text-gray-800 font-bold mb-2">
                                {selectedCustomRoom ? 'Anchor Points:' : 'Demo Anchor Points:'}
                            </label>
                            <div
                                id="anchor-points"
                                className="border p-3 w-full h-60 bg-white text-text rounded-lg whitespace-pre-wrap leading-tight overflow-auto"
                                style={{ fontFamily: 'inherit', lineHeight: 1.2, margin: 0 }}
                                role="textbox"
                                aria-readonly="true"
                                aria-label="Demo anchor points for the selected room type"
                            >
                                {currentAnchorPoints.join('\n')}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="memorables" className="block text-gray-800 font-bold">
                                Memorables (one per line):
                            </label>
                            <textarea
                                id="memorables"
                                value={memorables}
                                onChange={(e) => setMemorables(e.target.value)}
                                placeholder=""
                                disabled={isLoading}
                                className="w-full h-60 bg-white text-text p-3 rounded-lg border border-accent1 focus:border-primary focus:ring-1 focus:ring-primary outline-none focus-visible:ring-2 focus-visible:ring-accent1 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-describedby="memorables-help"
                                aria-label="Enter memorable items, one per line"
                            />
                            <div id="memorables-help" className="sr-only">
                                Enter the items or concepts you want to remember. Each item should be on a separate line. Use concrete, visual words for best results.
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {error && (
                            <ErrorMessage
                                error={error}
                                context="image-generation"
                                onRetry={handleRetry}
                                className="mb-4"
                            />
                        )}
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/saved-rooms')}
                                className="px-6 py-3 bg-primary text-white border-2 border-primary rounded-lg
                                         hover:bg-primary-dark hover:text-white transition-colors duration-300
                                         focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                aria-describedby="dashboard-help"
                            >
                                Back to Dashboard
                            </button>
                            <div id="dashboard-help" className="sr-only">
                                Return to your dashboard to view your saved memory palaces.
                            </div>
                            <button
                                type="button"
                                onClick={handleProceedToVisualizer}
                                disabled={isLoading}
                                className="flex-1 px-6 py-3 bg-primary text-white border-2 border-secondary rounded-lg
                                         hover:bg-[#7C3AED] hover:text-white transition-colors duration-300
                                         disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent1"
                                aria-describedby="proceed-help"
                            >
                                {isLoading ? (
                                    <>
                                        <LoadingSpinner size="sm" text="" className="mr-2" />
                                        GENERATING IMAGES...
                                    </>
                                ) : (
                                    'PROCEED TO VISUALIZER'
                                )}
                            </button>
                            <div id="proceed-help" className="sr-only">
                                Click to create your memory palace and navigate to the visualizer where you can generate images by clicking on anchor points.
                            </div>
                            <button
                                type="button"
                                onClick={handleClear}
                                disabled={isLoading}
                                className="px-6 py-3 bg-primary text-white border-2 border-secondary rounded-lg
                                         hover:bg-[#7C3AED] hover:text-white transition-colors duration-300
                                         disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent1"
                                aria-describedby="clear-help"
                            >
                                CLEAR FORM
                            </button>
                            <div id="clear-help" className="sr-only">
                                Click to clear all form fields and start over.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InputPage;
