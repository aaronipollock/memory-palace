import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const Draggable = ({ children, onDrag, initialPosition, onClick }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState(initialPosition);
    const elementRef = useRef(null);
    const dragStartPos = useRef(null);
    const moveThreshold = 5; // pixels to move before considering it a drag

    const handleMouseMove = useCallback((e) => {
        if (isDragging && elementRef.current) {
            const containerRect = elementRef.current.parentElement.getBoundingClientRect();
            const x = Math.min(Math.max(0, e.clientX - containerRect.left), containerRect.width);
            const y = Math.min(Math.max(0, e.clientY - containerRect.top), containerRect.height);

            // Calculate distance moved
            const dx = Math.abs(e.clientX - dragStartPos.current.x);
            const dy = Math.abs(e.clientY - dragStartPos.current.y);

            // If moved more than threshold, update position
            if (dx > moveThreshold || dy > moveThreshold) {
                dragStartPos.current.hasDragged = true;
                const newPosition = { x, y };
                setPosition(newPosition);
                onDrag(newPosition);
            }
        }
    }, [isDragging, onDrag]);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        dragStartPos.current = {
            x: e.clientX,
            y: e.clientY,
            hasDragged: false
        };
        e.preventDefault();
    };

    const handleMouseUp = useCallback((e) => {
        if (isDragging) {
            // If hasn't moved beyond threshold, treat as click
            if (!dragStartPos.current.hasDragged) {
                onClick(e);
            }
            setIsDragging(false);
            dragStartPos.current = null;
        }
    }, [isDragging, onClick]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div
            ref={elementRef}
            style={{
                position: 'absolute',
                left: position.x,
                top: position.y,
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none',
                transform: 'translate(-50%, -50%)'
            }}
            onMouseDown={handleMouseDown}
        >
            {children}
        </div>
    );
};

const RoomVisualizer = ({ associations = [], roomType, onBack }) => {
    const [selectedItem, setSelectedItem] = useState(null);
    const [roomImage, setRoomImage] = useState(null);
    const [itemPositions, setItemPositions] = useState(() => {
        // Initialize positions in a grid layout
        const positions = {};
        const gridCols = Math.ceil(Math.sqrt(associations.length));
        const cellWidth = 1333 / (gridCols + 1);  // Using our 16:9 width
        const cellHeight = 750 / (gridCols + 1);   // Using our 16:9 height

        associations.forEach((assoc, index) => {
            const row = Math.floor(index / gridCols);
            const col = index % gridCols;
            positions[assoc.roomFeature] = {
                x: cellWidth * (col + 1),
                y: cellHeight * (row + 1)
            };
        });

        return positions;
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const generateRoom = async () => {
            if (!associations.length || !roomType) {
                console.log('Missing required data:', { associations, roomType });
                setError('Missing required data for room generation');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);
            setRoomImage(null);  // Clear the image immediately

            try {
                const anchorPoints = associations.map(assoc => assoc.roomFeature);
                const response = await axios.post('http://localhost:5000/api/generate-room', {
                    roomType,
                    anchorPoints
                });

                if (response.data.roomImage) {
                    setRoomImage(response.data.roomImage);
                }
            } catch (err) {
                console.error('Room generation error:', err);
                setError(err.message || 'Failed to generate room layout');
            } finally {
                setIsLoading(false);
            }
        };

        generateRoom();
    }, [associations, roomType]);

    if (isLoading) {
        return (
            <div className='flex items-center justify-center min-h-[600px] bg-surface rounded-lg'>
                <div className='text-primary'>
                    <div className='animate-spin mr-2 inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full'></div>
                    Generating {roomType} layout...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='flex flex-col items-center justify-center min-h-[600px] bg-surface rounded-lg'>
                <div className='text-red-500 mb-4'>{error}</div>
                <div className='text-text text-sm'>Check the console for more details</div>
            </div>
        );
    }

    return (
        <div className='w-full max-w-[1400px] mx-auto p-8'>
            <div className='relative w-[1333px] h-[750px] mx-auto rounded-lg overflow-hidden bg-surface'>
                {roomImage && (
                    <img
                        src={roomImage}
                        alt='Room layout'
                        className='w-full h-full object-contain'
                    />
                )}
                {associations.map((item, index) => {
                    const position = itemPositions[item.roomFeature] || { x: 666.5, y: 375 };

                    return (
                        <Draggable
                            key={index}
                            initialPosition={position}
                            onDrag={(newPos) => {
                                setItemPositions(prev => ({
                                    ...prev,
                                    [item.roomFeature]: newPos
                                }));
                            }}
                            onClick={() => setSelectedItem(selectedItem === index ? null : index)}
                        >
                            <div
                                className="w-10 h-10 bg-primary bg-opacity-20 border-2 border-primary rounded-full
                                        flex items-center justify-center transition-all duration-300
                                        hover:bg-opacity-40 hover:scale-110 z-10"
                            >
                                <div className="text-sm text-primary">
                                    {item.roomFeature}
                                </div>
                                {selectedItem === index && (
                                    <div className='absolute -top-40 left-1/2 transform -translate-x-1/2
                                                  bg-background rounded-lg p-4 w-[200px] shadow-lg z-20'>
                                        <img
                                            src={item.url}
                                            alt={item.memorable}
                                            className="w-full h-[150px] object-cover rounded mb-2"
                                        />
                                        <div className="text-center">
                                            <h4 className="text-primary mb-1">{item.item}</h4>
                                            <p className="text-text text-sm mb-2">Associated with: {item.roomFeature}</p>
                                            <p className="text-text text-sm italic">
                                                "Remember this by how the {item.item} {item.description ||
                                                `interacts with the ${item.roomFeature}, creating a memorable scene`}"
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Draggable>
                    );
                })}
            </div>

            <div className="text-center mt-4 text-text text-sm mb-4">
                Drag the circles to position them over the room items
            </div>

            <div className='flex justify-center'>
                <button
                    onClick={onBack}
                    className="px-6 py-3 bg-background text-primary border-2 border-primary rounded-lg
                             hover:bg-primary hover:text-background transition-colors duration-300"
                >
                    ← Back to Input
                </button>
            </div>
        </div>
    );
};

export default RoomVisualizer;
