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

// const DEMO_IMAGES = [
//     {
//         url: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=400',
//         item: 'Modern TV Console',
//         memorable: 'Sleek entertainment center with clean lines',
//         roomFeature: 'TV/Media Area'
//     },
//     {
//         url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=400',
//         item: 'Grey Sectional Sofa',
//         memorable: 'Comfortable L-shaped couch perfect for movie nights',
//         roomFeature: 'Seating Area'
//     },
//     {
//         url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=400',
//         item: 'Fiddle Leaf Fig',
//         memorable: 'Tall indoor plant with large leaves',
//         roomFeature: 'Plant Area'
//     },
//     {
//         url: 'https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?q=80&w=400',
//         item: 'Coffee Table Books',
//         memorable: 'Collection of art and design books',
//         roomFeature: 'Coffee Table'
//     },
//     {
//         url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=400',
//         item: 'Floor Lamp',
//         memorable: 'Modern arc lamp with marble base',
//         roomFeature: 'Lighting'
//     }
// ];

const LIVING_ROOM_IMAGE = 'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
const ANCHOR_POINTS = ["sofa", "painting", "coffee table", "window", "plant"];

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
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [images, setImages] = useState([]);
    const [customMemorables, setCustomMemorables] = useState([]);

    // Save to localStorage whenever values change
    useEffect(() => {
        localStorage.setItem('anchorPoints', anchorPoints);
        localStorage.setItem('memorables', memorables);
        localStorage.setItem('pairingStrategy', pairingStrategy);
        localStorage.setItem('roomType', roomType);
    }, [anchorPoints, memorables, pairingStrategy, roomType]);

    // Add console.log to debug
    console.log('onImagesGenerated prop:', onImagesGenerated);

    const handleSubmit = async (e) => {
        e.preventDefault();

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

    const handleDemoClick = () => {
        setIsDemoMode(true);
        setImages(LIVING_ROOM_IMAGE);
        setRoomType('living room');
        onImagesGenerated(LIVING_ROOM_IMAGE, 'living room');
    };

    const handleAddMemorable = (index, memorable) => {
        const updatedImages = [...images];
        updatedImages[index].memorable = memorable;
        setCustomMemorables(updatedImages);
    };

    const handleProceedToVisualizer = () => {
        const memorablesList = memorables.split('\n')
            .map(item => item.trim())
            .filter(Boolean);

        console.log('Memorables list:', memorablesList);

        const associations = ANCHOR_POINTS.map((anchor, index) => ({
            anchor,
            memorable: memorablesList[index] || ''
        }));

        console.log('Created associations:', associations);
        onImagesGenerated(associations, roomType);
    };

    return (
        <div className="container mx-auto px-4 py-2">
            {/* {!isDemoMode && !images.length && (
                <div className="text-center mb-8">
                    <button
                        onClick={handleDemoClick}
                        className="px-6 py-3 bg-primary text-background rounded-lg hover:bg-primary-dark
                                 transition-colors duration-300 mb-4"
                    >
                        Try Demo with Sample Images
                    </button>
                    <p className="text-text text-sm">
                        Or upload your own images below
                    </p>
                </div>
            )} */}

            {/* {isDemoMode && (
                <div className="mb-8">
                    <h3 className="text-lg font-bold mb-4">Add Your Own Memorables</h3>
                    <div className="mb-4">
                        <img src={LIVING_ROOM_IMAGE} alt="Living Room" className="w-full h-auto object-cover mb-2" />
                        <pre className="border p-3 w-full h-40 bg-background text-text rounded-lg whitespace-pre-wrap" style={{ fontFamily: 'inherit' }}>
                            {ANCHOR_POINTS.join('\n')}
                        </pre>
                        <textarea
                            value={memorables}
                            onChange={(e) => setMemorables(e.target.value)}
                            placeholder="Enter memorables, one per line"
                            className="border p-2 w-full mt-2"
                        />
                    </div>
                    <button
                        onClick={handleProceedToVisualizer}
                        className="px-6 py-3 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors duration-300 mt-4"
                    >
                        Proceed to Visualizer
                    </button>
                </div>
            )} */}

            {!isDemoMode && (
                <div className="max-w-4xl mx-auto p-6 bg-text rounded-xl">
                    <div className="border-8 border-text rounded-lg p-6 bg-background">
                        <h2 className="text-3xl font-bold text-primary mb-6 text-center">Create Your Memory Palace</h2>

                        <div className="bg-surface rounded-lg p-6 mb-8 text-text">
                            <p className="mb-4">To create your memory palace, follow these steps:</p>
                            <ol className="list-decimal pl-6 space-y-2">
                                <li><strong className="text-primary">Room Type:</strong> Choose the type of room for your memory palace.</li>
                                <li><strong className="text-primary">Anchor Points:</strong>In Demo Mode, we've chosen these features for you.</li>
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
                                        Demo Anchor Points:
                                    </label>
                                    {/* <textarea
                                        value={anchorPoints}
                                        onChange={(e) => setAnchorPoints(e.target.value)}
                                        placeholder="Example:
TV
sofa
plant
coffee table
lamp"
                                        disabled={isLoading}
                                        className="w-full h-40 bg-background text-text p-3 rounded-lg border border-primary/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    /> */}
                                    <pre className="border p-3 w-full h-40 bg-background text-text rounded-lg whitespace-pre-wrap" style={{ fontFamily: 'inherit' }}>
                                        {anchorPoints ||
                                        "painting\nsofa\ncoffee table\nwindow\nplant"
                                        }
                                    </pre>
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
                                        onClick={handleProceedToVisualizer}
                                        // disabled={!anchorPoints.trim() || !memorables.trim() || !roomType || isLoading}
                                        className="flex-1 bg-background text-primary border border-primary py-3 px-6 rounded-lg
                                                 hover:bg-primary hover:text-background transition-colors duration-300
                                                 disabled:opacity-50 disabled:cursor-not-allowed
                                                 disabled:hover:bg-background disabled:hover:text-primary"
                                    >
                                        {isLoading ? (
                                            <span className="inline-flex items-center">
                                                Creating your memory associations
                                                <span className="ml-1 animate-[ellipsis_1.5s_infinite]">...</span>
                                            </span>
                                        ) : (
                                            'Proceed to Visualizer'
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleClear}
                                        disabled={isLoading}
                                        className="px-6 py-3 bg-primary text-background border-2 border-primary rounded-lg
                                                 hover:bg-background hover:text-primary transition-colors duration-300
                                                 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Clear Form
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {images.length > 0 && (
                <div>
                    {/* ... existing images grid ... */}
                </div>
            )}
        </div>
    );
};

export default InputPage;
