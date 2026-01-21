import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { useToast } from '../context/ToastContext';
import { SecureAPIClient } from '../utils/security';
import { getApiUrl } from '../config/api';

const apiClient = new SecureAPIClient(getApiUrl(''));

// Anchor Point Editor - allows users to place, edit, and reorder anchor points on custom room images

const AnchorPointEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const imageRef = useRef(null);
    const [room, setRoom] = useState(null);
    const [anchorPoints, setAnchorPoints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [editingPoint, setEditingPoint] = useState(null);
    const [pointName, setPointName] = useState('');
    const [pointDescription, setPointDescription] = useState('');
    const [editingRoom, setEditingRoom] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [roomDescription, setRoomDescription] = useState('');
    const [isSavingRoom, setIsSavingRoom] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        loadRoom();
    }, [id]);

    // Fetches custom room data and anchor points from API
    const loadRoom = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await apiClient.get(`/api/custom-rooms/${id}`);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Room not found');
                }
                if (response.status === 403) {
                    throw new Error('You do not have permission to edit this room');
                }
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to load room');
            }

            const roomData = await response.json();
            setRoom(roomData);
            setRoomName(roomData.name);
            setRoomDescription(roomData.description || '');
            setAnchorPoints(roomData.anchorPoints || []);

            // Log image URL for debugging
            console.log('Custom room imageUrl:', roomData.imageUrl);
            console.log('Backend API URL:', getApiUrl(''));
        } catch (err) {
            console.error('Error loading room:', err);
            setError(err.message || 'Failed to load room');
            showError(err.message || 'Failed to load room');
        } finally {
            setIsLoading(false);
        }
    };

    // Calculates click position as percentage and opens modal to create new anchor point
    const handleImageClick = (e) => {
        if (!imageRef.current) return;

        const rect = imageRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setEditingPoint({
            x: Math.round(x * 100) / 100,
            y: Math.round(y * 100) / 100,
            name: '',
            description: ''
        });
        setPointName('');
        setPointDescription('');
    };

    // Saves new anchor point or updates existing one
    const handleSavePoint = async () => {
        if (!pointName.trim()) {
            setError('Please enter a name for the anchor point');
            return;
        }

        try {
            setIsSaving(true);
            setError(null);

            let updatedPoints;
            if (editingPoint && editingPoint._id) {
                updatedPoints = anchorPoints.map(p =>
                    p._id === editingPoint._id
                        ? { ...p, name: pointName.trim(), description: pointDescription.trim() }
                        : p
                );
            } else {
                const newPoint = {
                    name: pointName.trim(),
                    description: pointDescription.trim(),
                    x: editingPoint.x,
                    y: editingPoint.y
                };
                updatedPoints = [...anchorPoints, newPoint];
            }
            const response = await apiClient.put(`/api/custom-rooms/${id}`, {
                anchorPoints: updatedPoints
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save anchor point');
            }

            const updatedRoom = await response.json();
            setAnchorPoints(updatedRoom.anchorPoints || []);
            setEditingPoint(null);
            setPointName('');
            setPointDescription('');
            showSuccess('Anchor point saved successfully!');
        } catch (err) {
            console.error('Error saving anchor point:', err);
            setError(err.message || 'Failed to save anchor point');
            showError(err.message || 'Failed to save anchor point');
        } finally {
            setIsSaving(false);
        }
    };

    // Deletes anchor point and updates room in database
    const handleDeletePoint = async (pointToDelete) => {
        if (!window.confirm('Are you sure you want to delete this anchor point?')) {
            return;
        }

        try {
            setIsSaving(true);
            setError(null);

            const updatedPoints = anchorPoints.filter(p => {
                if (pointToDelete._id && p._id) {
                    return p._id.toString() !== pointToDelete._id.toString();
                }
                return !(p.x === pointToDelete.x && p.y === pointToDelete.y && p.name === pointToDelete.name);
            });

            const response = await apiClient.put(`/api/custom-rooms/${id}`, {
                anchorPoints: updatedPoints
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete anchor point');
            }

            const updatedRoom = await response.json();
            setAnchorPoints(updatedRoom.anchorPoints || []);
            showSuccess('Anchor point deleted successfully!');
        } catch (err) {
            console.error('Error deleting anchor point:', err);
            setError(err.message || 'Failed to delete anchor point');
            showError(err.message || 'Failed to delete anchor point');
        } finally {
            setIsSaving(false);
        }
    };

    // Opens edit modal for existing anchor point
    const handleEditPoint = (point) => {
        setEditingPoint(point);
        setPointName(point.name);
        setPointDescription(point.description || '');
    };

    // Initiates drag operation for reordering anchor points
    const handleDragStart = (e, index) => {
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
            e.preventDefault();
            return;
        }

        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
        e.currentTarget.style.opacity = '0.5';
    };

    // Allows drop by preventing default behavior and provides visual feedback
    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';

        if (draggedIndex !== null && draggedIndex !== index) {
            e.currentTarget.classList.add('bg-blue-50', 'border-blue-300');
        }
    };

    // Handles dropping anchor point in new position, reorders array, and saves to backend
    const handleDrop = async (e, dropIndex) => {
        e.preventDefault();
        e.stopPropagation();

        e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300');

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            return;
        }

        try {
            setIsSaving(true);
            setError(null);

            const newAnchorPoints = [...anchorPoints];
            const [draggedItem] = newAnchorPoints.splice(draggedIndex, 1);
            newAnchorPoints.splice(dropIndex, 0, draggedItem);
            const response = await apiClient.put(`/api/custom-rooms/${id}`, {
                anchorPoints: newAnchorPoints
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to reorder anchor points');
            }

            const updatedRoom = await response.json();
            setAnchorPoints(updatedRoom.anchorPoints || []);
            showSuccess('Anchor points reordered successfully!');
        } catch (err) {
            console.error('Error reordering anchor points:', err);
            setError(err.message || 'Failed to reorder anchor points');
            showError(err.message || 'Failed to reorder anchor points');
        } finally {
            setIsSaving(false);
            setDraggedIndex(null);
        }
    };

    // Cleans up drag state after drag operation ends
    const handleDragEnd = (e) => {
        e.currentTarget.style.opacity = '1';
        e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300');
        setDraggedIndex(null);
    };

    // Removes visual feedback when dragging leaves an item
    const handleDragLeave = (e) => {
        e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300');
    };

    // Saves changes to room name and description
    const handleSaveRoomMetadata = async () => {
        if (!roomName.trim()) {
            setError('Room name is required');
            return;
        }

        try {
            setIsSavingRoom(true);
            setError(null);

            const response = await apiClient.put(`/api/custom-rooms/${id}`, {
                name: roomName.trim(),
                description: roomDescription.trim()
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update room');
            }

            const updatedRoom = await response.json();
            setRoom(updatedRoom);
            setEditingRoom(false);
            showSuccess('Room updated successfully!');
        } catch (err) {
            console.error('Error updating room:', err);
            setError(err.message || 'Failed to update room');
            showError(err.message || 'Failed to update room');
        } finally {
            setIsSavingRoom(false);
        }
    };

    if (isLoading) {
        return (
            <div className="page-bg-content">
                <NavBar />
                <div className="container mx-auto px-4 py-8">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (error && !room) {
        return (
            <div className="page-bg-content">
                <NavBar />
                <div className="container mx-auto px-4 py-8">
                    <ErrorMessage error={new Error(error)} />
                    <button
                        onClick={() => navigate('/custom-rooms/upload')}
                        className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-[#7C3AED]"
                    >
                        Back to Upload
                    </button>
                </div>
            </div>
        );
    }

    if (!room) {
        return null;
    }

    return (
        <div className="page-bg-content">
            <NavBar />

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="mb-6 flex items-start justify-between">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold mb-2">{room.name}</h1>
                        {room.description && (
                            <p className="text-gray-600">{room.description}</p>
                        )}
                    </div>
                    <button
                        onClick={() => {
                            setEditingRoom(true);
                            setRoomName(room.name);
                            setRoomDescription(room.description || '');
                        }}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-[#7C3AED] transition-colors ml-4"
                        title="Edit room details"
                    >
                        Edit Room
                    </button>
                </div>

                {error && <ErrorMessage error={new Error(error)} />}

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold mb-2">Click on the image to place anchor points</h2>
                        <p className="text-sm text-gray-600 mb-3">
                            Anchor points mark locations where you'll place memorable items in your memory palace.
                        </p>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Tips for Better Anchor Point Placement
                            </h3>
                            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                                <li>Distribute points across different areas of the room (corners, center, edges)</li>
                                <li>Choose distinct, memorable locations (door, window, furniture, etc.)</li>
                                <li>Follow a logical path through the room (left to right, or clockwise)</li>
                            </ul>
                        </div>

                    </div>

                    <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100" style={{ minHeight: '400px' }}>
                        <img
                            ref={imageRef}
                            src={(() => {
                                if (!room.imageUrl) return '';
                                // If it's a relative path, prefix with backend URL
                                if (room.imageUrl.startsWith('/')) {
                                    const backendUrl = getApiUrl('').replace(/\/$/, '');
                                    return `${backendUrl}${room.imageUrl}`;
                                }
                                // If it contains localhost, replace with backend URL
                                if (room.imageUrl.includes('localhost')) {
                                    const backendUrl = getApiUrl('').replace(/\/$/, '');
                                    // Match and replace the entire origin (protocol + host + port)
                                    return room.imageUrl.replace(/https?:\/\/[^\/:]+(?::\d+)?/, backendUrl);
                                }
                                // Otherwise use as-is (should be a full URL)
                                return room.imageUrl;
                            })()}
                            alt={room.name}
                            className="w-full h-auto cursor-crosshair"
                            onClick={handleImageClick}
                            style={{ display: 'block' }}
                            onError={(e) => {
                                console.error('Image failed to load:', {
                                    originalUrl: room.imageUrl,
                                    computedSrc: e.target.src,
                                    backendUrl: getApiUrl('')
                                });
                            }}
                        />

                        {anchorPoints.map((point, index) => (
                            <div
                                key={point._id || index}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                                style={{
                                    left: `${point.x}%`,
                                    top: `${point.y}%`
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditPoint(point);
                                }}
                            >
                                <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">{index + 1}</span>
                                </div>

                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                    {point.name}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {anchorPoints.length === 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="text-gray-600">
                            <p className="mb-2 font-medium">No anchor points yet. Click on the image above to add one.</p>
                            <p className="text-sm text-gray-500 italic">
                                Tip: Place anchor points at distinct, memorable locations in your room.
                                You'll use these to associate items you want to remember.
                            </p>
                        </div>
                    </div>
                )}

                {anchorPoints.length > 0 && (
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">
                            Ready to Create Your Memory Palace?
                        </h3>
                        <p className="text-blue-800 mb-4">
                            You've placed {anchorPoints.length} anchor point{anchorPoints.length !== 1 ? 's' : ''}.
                            Now you can create a memory palace using this room! The room will be automatically selected
                            and your anchor points will be ready to use.
                        </p>
                        <button
                            onClick={() => {
                                localStorage.setItem('customRoomId', id);
                                localStorage.setItem('roomType', 'custom');
                                navigate('/input');
                            }}
                            className="px-6 py-3 bg-primary text-white rounded-md hover:bg-secondary font-medium transition-colors shadow-md hover:shadow-lg"
                        >
                            Create Memory Palace with This Room →
                        </button>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold mb-2">Anchor Points ({anchorPoints.length})</h2>
                        {anchorPoints.length > 1 && (
                            <div className="flex items-center gap-2 text-sm text-primary font-medium bg-primary/10 px-3 py-2 rounded-md border border-primary/20">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 8h16M4 16h16"
                                    />
                                </svg>
                                <span>Drag items in this list to reorder them</span>
                            </div>
                        )}
                    </div>

                    {anchorPoints.length === 0 ? (
                        <p className="text-gray-500">Click on the image above to add your first anchor point.</p>
                    ) : (
                        <div className="space-y-2">
                            {anchorPoints.map((point, index) => (
                                <div
                                    key={point._id || index}
                                    draggable={!isSaving}
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDrop={(e) => handleDrop(e, index)}
                                    onDragEnd={handleDragEnd}
                                    onDragLeave={handleDragLeave}
                                    className={`flex items-center justify-between p-4 border-2 border-gray-300 rounded-lg hover:border-primary hover:shadow-md transition-all ${
                                        draggedIndex === index ? 'opacity-50 cursor-grabbing border-primary' : 'cursor-grab'
                                    } ${isSaving ? 'pointer-events-none opacity-50' : ''}`}
                                >
                                    <div className="flex items-center space-x-3 flex-1">
                                        <div className="text-primary hover:text-[#7C3AED] flex-shrink-0 cursor-grab active:cursor-grabbing">
                                            <svg
                                                className="w-6 h-6"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 6h16M4 12h16M4 18h16"
                                                />
                                            </svg>
                                        </div>
                                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900">{point.name}</div>
                                            {point.description && (
                                                <div className="text-sm text-gray-600">{point.description}</div>
                                            )}
                                            <div className="text-xs text-gray-400">
                                                Position: ({point.x.toFixed(1)}%, {point.y.toFixed(1)}%)
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditPoint(point);
                                            }}
                                            draggable={false}
                                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                            disabled={isSaving}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeletePoint(point);
                                            }}
                                            draggable={false}
                                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                                            disabled={isSaving}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {editingRoom && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-xl font-semibold mb-4">Edit Room Details</h3>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Room Name *
                                </label>
                                <input
                                    type="text"
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    placeholder="e.g., My Living Room"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                    autoFocus
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={roomDescription}
                                    onChange={(e) => setRoomDescription(e.target.value)}
                                    placeholder="Add a description..."
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setEditingRoom(false);
                                        setRoomName(room.name);
                                        setRoomDescription(room.description || '');
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    disabled={isSavingRoom}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveRoomMetadata}
                                    disabled={isSavingRoom || !roomName.trim()}
                                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-[#7C3AED] disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {isSavingRoom ? (
                                        <span className="flex items-center gap-2">
                                            <LoadingSpinner size="small" />
                                            Saving...
                                        </span>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {editingPoint && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-xl font-semibold mb-4">
                                {editingPoint._id ? 'Edit' : 'Add'} Anchor Point
                            </h3>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    value={pointName}
                                    onChange={(e) => setPointName(e.target.value)}
                                    placeholder="e.g., Door, Window, Desk"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                    autoFocus
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={pointDescription}
                                    onChange={(e) => setPointDescription(e.target.value)}
                                    placeholder="Add a description..."
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                />
                            </div>

                            {!editingPoint._id && (
                                <div className="mb-4 text-sm text-gray-600">
                                    Position: ({editingPoint.x.toFixed(1)}%, {editingPoint.y.toFixed(1)}%)
                                </div>
                            )}

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setEditingPoint(null);
                                        setPointName('');
                                        setPointDescription('');
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSavePoint}
                                    disabled={isSaving || !pointName.trim()}
                                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-[#7C3AED] disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? (
                                        <span className="flex items-center gap-2">
                                            <LoadingSpinner size="small" />
                                            Saving...
                                        </span>
                                    ) : (
                                        'Save'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-6 flex justify-end space-x-4">
                    <button
                        onClick={() => navigate('/custom-rooms/upload')}
                        className="px-6 py-2 bg-primary border border-gray-300 rounded-md text-white hover:bg-secondary"
                    >
                        Create Another Room
                    </button>
                    <button
                        onClick={() => navigate('/saved-rooms')}
                        className="px-6 py-2 bg-primary text-white rounded-md hover:bg-secondary"
                    >
                        View All Rooms
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnchorPointEditor;
