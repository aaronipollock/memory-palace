import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import ProfileSettingsModal from './ProfileSettingsModal';
import PalacePreview from './PalacePreview';
import { useToast } from '../context/ToastContext';
import { SecureAPIClient } from '../utils/security';
// import { ROOM_IMAGES } from '../constants/roomData';

import { getApiUrl } from '../config/api';
const apiClient = new SecureAPIClient(getApiUrl(''));

const UserDashboard = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [showProfileSettings, setShowProfileSettings] = useState(false);
    const [palaces, setPalaces] = useState([]);
    const [customRooms, setCustomRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userEmail, setUserEmail] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [palaceToDelete, setPalaceToDelete] = useState(null);
    const [customRoomToDelete, setCustomRoomToDelete] = useState(null);
    const navigate = useNavigate();
    const { showSuccess, showError, showInfo } = useToast();

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        // For all users (including demo), decode token and fetch from API
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUserEmail(payload.email);
            fetchPalaces();
            fetchCustomRooms();
        } catch (err) {
            console.error('Error decoding token:', err);
            const tokenError = new Error('Invalid authentication token');
            tokenError.response = { status: 401 };
            setError(tokenError);
            setLoading(false);
        }

        // Listen for global event to refresh custom rooms (when modal creates a new room)
        const handleRefresh = () => {
            fetchCustomRooms();
        };
        window.addEventListener('refreshCustomRooms', handleRefresh);
        return () => {
            window.removeEventListener('refreshCustomRooms', handleRefresh);
        };
    }, [navigate]);

    // Fetch user profile data
    const fetchUserProfile = async () => {
        try {
            const response = await apiClient.get('/api/user/profile');
            if (response.ok) {
                const profileData = await response.json();
                setUser(profileData);
            } else {
                console.error('Failed to fetch user profile');
            }
        } catch (err) {
            console.error('Error fetching user profile:', err);
        }
    };

    // Fetch user statistics
    const fetchUserStats = async () => {
        try {
            const response = await apiClient.get('/api/user/stats');
            if (response.ok) {
                const statsData = await response.json();
                setStats(statsData);
            } else {
                console.error('Failed to fetch user stats');
            }
        } catch (err) {
            console.error('Error fetching user stats:', err);
        }
    };

    useEffect(() => {
        fetchUserProfile();
        fetchUserStats();
    }, []);

    const fetchPalaces = async () => {
        try {
            const response = await apiClient.get('/api/memory-palaces');

            if (!response.ok) {
                if (response.status === 401) {
                    // If unauthorized, redirect to login
                    navigate('/');
                    return;
                }
                const data = await response.json();
                const errorObj = new Error(data.message || 'Failed to fetch memory palaces');
                errorObj.response = { data, status: response.status };
                throw errorObj;
            }

            const data = await response.json();
            setPalaces(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomRooms = async () => {
        try {
            const response = await apiClient.get('/api/custom-rooms');
            if (response.ok) {
                const data = await response.json();
                setCustomRooms(data);
            }
        } catch (err) {
            console.error('Error fetching custom rooms:', err);
            // Don't set error state - custom rooms are optional
        }
    };

    const handlePalaceClick = (palace) => {
        // Store only essential palace data in localStorage to avoid quota issues
        const palaceDataForStorage = {
            _id: palace._id,
            name: palace.name,
            roomType: palace.roomType,
            associations: palace.associations,
            completionStatus: palace.completionStatus,
            acceptedImages: palace.acceptedImages || {}, // Keep accepted images for loading
            customRoomId: palace.customRoomId || null,
            customRoomImageUrl: palace.customRoomImageUrl || null
        };

        // If acceptedImages contains base64 data, convert to paths only
        if (palaceDataForStorage.acceptedImages && Object.keys(palaceDataForStorage.acceptedImages).length > 0) {
            const processedAcceptedImages = {};
            Object.keys(palaceDataForStorage.acceptedImages).forEach(anchor => {
                const imageData = palaceDataForStorage.acceptedImages[anchor];
                if (imageData && imageData.image) {
                    // If it's base64 data, don't store it in localStorage
                    if (imageData.image.startsWith('data:image')) {
                        // Skip base64 images - they'll be loaded from the backend
                        return;
                    }
                    // If it's a file path, keep it
                    processedAcceptedImages[anchor] = imageData;
                }
            });
            palaceDataForStorage.acceptedImages = processedAcceptedImages;
        }

        // Clear localStorage first to free up space
        localStorage.removeItem('currentPalace');
        localStorage.removeItem('imageMetadata');

        localStorage.setItem('currentPalace', JSON.stringify(palaceDataForStorage));
        showInfo(`Loading memory palace "${palace.name}"...`);
        navigate('/visualizer');
    };

    const handleDeleteClick = (e, palace) => {
        e.stopPropagation();
        setPalaceToDelete(palace);
        setCustomRoomToDelete(null);
        setDeleteModalOpen(true);
    };

    const handleDeleteCustomRoomClick = (e, room) => {
        e.stopPropagation();
        setCustomRoomToDelete(room);
        setPalaceToDelete(null);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            if (customRoomToDelete) {
                // Delete custom room
                const response = await apiClient.delete(`/api/custom-rooms/${customRoomToDelete._id}`);

                if (!response.ok) {
                    const data = await response.json();
                    const errorObj = new Error(data.error || 'Failed to delete custom room');
                    errorObj.response = { data, status: response.status };
                    throw errorObj;
                }

                setCustomRooms(customRooms.filter(r => r._id !== customRoomToDelete._id));
                showSuccess(`Custom room "${customRoomToDelete.name}" deleted successfully!`);
            } else if (palaceToDelete) {
                // Delete memory palace
                const response = await apiClient.delete(`/api/memory-palaces/${palaceToDelete._id}`);

                if (!response.ok) {
                    const data = await response.json();
                    const errorObj = new Error(data.message || 'Failed to delete memory palace');
                    errorObj.response = { data, status: response.status };
                    throw errorObj;
                }

                setPalaces(palaces.filter(p => p._id !== palaceToDelete._id));
                showSuccess(`Memory palace "${palaceToDelete.name}" deleted successfully!`);
            }
        } catch (err) {
            setError(err);
            showError(customRoomToDelete
                ? 'Failed to delete custom room. Please try again.'
                : 'Failed to delete memory palace. Please try again.');
        }
        setDeleteModalOpen(false);
        setPalaceToDelete(null);
        setCustomRoomToDelete(null);
    };

    const handleCancelDelete = () => {
        setDeleteModalOpen(false);
        setPalaceToDelete(null);
        setCustomRoomToDelete(null);
    };

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                // Call the backend logout API to trigger demo palace reset
                await fetch(getApiUrl('/api/auth/logout'), {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });
            }
        } catch (error) {
            console.error('Logout API call failed:', error);
            // Continue with logout even if API call fails
        } finally {
            // Always clear local storage and navigate
            localStorage.removeItem('token');
            navigate('/');
        }
    };

    const handleRetryLoad = () => {
        setError(null);
        setLoading(true);
        fetchPalaces();
    };

    const handleProfileUpdate = (updatedUser) => {
        setUser(updatedUser);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <NavBar onLogout={handleLogout} />
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <LoadingSpinner size="lg" text="Loading your memory palaces..." />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#7C3AED]/60 via-[#8B5CF6]/40 to-white">
            <NavBar onLogout={handleLogout} />
            <div className="container mx-auto px-4 py-8">
                {/* Profile Header Section */}
                <div className="bg-white/90 rounded-lg shadow-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center space-x-4 mb-4 md:mb-0">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                {user?.firstName ? user.firstName.charAt(0).toUpperCase() : (userEmail ? userEmail.charAt(0).toUpperCase() : 'U')}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">
                                    {userEmail === 'demo@example.com' ? 'Demo User' :
                                     user?.firstName ? `Welcome back, ${user.firstName}!` : 'Welcome back!'}
                                </h1>
                                <p className="text-gray-600">{userEmail}</p>
                                {user?.username && (
                                    <p className="text-sm text-gray-500">@{user.username}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => navigate('/input')}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                            >
                                Create New Palace
                            </button>
                            <button
                                onClick={() => setShowProfileSettings(true)}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                            >
                                Profile Settings
                            </button>
                        </div>
                    </div>
                </div>

                <h2 className="text-3xl font-bold mb-6 text-center">
                    {userEmail === 'demo@example.com' ? 'Demo Memory Palaces' : 'Your Memory Palaces'}
                </h2>

                {/* Custom Rooms Section */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold text-center flex-1">Your Custom Rooms</h3>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            + Create Custom Room
                        </button>
                    </div>
                    {customRooms.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {customRooms.map((room) => (
                                <div
                                    key={room._id}
                                    onClick={() => navigate(`/custom-rooms/${room._id}/edit`)}
                                    className="bg-white/90 p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300 relative"
                                >
                                    <button
                                        onClick={(e) => handleDeleteCustomRoomClick(e, room)}
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-2 z-10"
                                        title="Delete custom room"
                                    >
                                        ×
                                    </button>
                                    <div className="mb-4">
                                        <img
                                            src={room.imageUrl}
                                            alt={room.name}
                                            className="w-full h-48 object-cover rounded-lg"
                                            onError={(e) => {
                                                e.target.src = '/images/placeholder.png';
                                            }}
                                        />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
                                    {room.description && (
                                        <p className="text-gray-600 text-sm mb-2">{room.description}</p>
                                    )}
                                    <p className="text-gray-500 text-sm">
                                        {room.anchorPoints?.length || 0} anchor point{room.anchorPoints?.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mb-6">
                        <ErrorMessage
                            error={error}
                            context="palace-load"
                            onRetry={handleRetryLoad}
                        />
                    </div>
                )}

                {(palaces.length === 0 && customRooms.length === 0) ? (
                    <div className="text-center text-gray-600 mt-8">
                        <p className="text-lg mb-4">No memory palaces found.</p>
                        {userEmail !== 'demo@example.com' && (
                            <button
                                onClick={() => navigate('/input')}
                                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-300"
                            >
                                Create Your First Palace
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {palaces.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {palaces.map((palace) => (
                            <div
                                key={palace._id || palace.name}
                                onClick={() => handlePalaceClick(palace)}
                                className="bg-white/90 p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300 relative"
                            >
                                <button
                                    onClick={(e) => handleDeleteClick(e, palace)}
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-2 z-10"
                                    title="Delete memory palace"
                                >
                                    ×
                                </button>

                                {/* Room Image with Preview */}
                                <div className="mb-4">
                                    <PalacePreview palace={palace} />
                                </div>

                                <h2 className="text-xl font-semibold mb-2">{palace.name}</h2>
                                <p className="text-gray-600 mb-4">Room Type: {palace.roomType === 'custom' ? 'Custom Room' : (palace.roomType || 'Throne Room')}</p>

                                {/* Completion Status */}
                                {palace.completionStatus && (
                                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-gray-700">Progress</span>
                                      <span className="text-sm text-gray-500">
                                        {palace.completionStatus.acceptedImages}/{palace.completionStatus.totalAnchors}
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                          palace.completionStatus.isComplete
                                            ? 'bg-green-500'
                                            : 'bg-blue-500'
                                        }`}
                                        style={{ width: `${palace.completionStatus.progressPercentage}%` }}
                                      ></div>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-xs text-gray-500">
                                        {palace.completionStatus.isComplete ? 'Complete' : 'In Progress'}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {palace.completionStatus.progressPercentage}%
                                      </span>
                                    </div>
                                  </div>
                                )}

                                <div className="space-y-2">
                                    {palace.associations && palace.associations.map((assoc, index) => (
                                        <div key={index} className="border-t pt-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <p className="font-medium">{assoc.memorableItem}</p>
                                                    <p className="text-sm text-gray-500">Anchor: {assoc.anchor}</p>
                                                </div>
                                                {assoc.hasAcceptedImage && (
                                                    <div className="ml-2">
                                                        <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full text-xs">
                                                            ✓
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                            </div>
                        )}
                    </>
                )}

                {/* Delete Confirmation Modal */}
                {deleteModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-xl font-semibold mb-4">
                                {customRoomToDelete ? 'Delete Custom Room' : 'Delete Memory Palace'}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete "{customRoomToDelete?.name || palaceToDelete?.name}"? This action cannot be undone.
                            </p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={handleCancelDelete}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Profile Settings Modal */}
            <ProfileSettingsModal
                isOpen={showProfileSettings}
                onClose={() => setShowProfileSettings(false)}
                user={user}
                onProfileUpdate={handleProfileUpdate}
            />

        </div>
    );
};

export default UserDashboard;
