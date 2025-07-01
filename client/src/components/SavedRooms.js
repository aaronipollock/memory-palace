import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { useToast } from '../context/ToastContext';

const API_URL = 'http://localhost:5001';

const SavedRooms = () => {
    const [palaces, setPalaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userEmail, setUserEmail] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [palaceToDelete, setPalaceToDelete] = useState(null);
    const navigate = useNavigate();
    const { showSuccess, showError, showInfo } = useToast();

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        // For demo mode, load seed data if no saved rooms exist
        if (token === 'demo-token') {
            // Force refresh seed data for demo
            const seedData = [
                {
                    name: "Weekly Grocery List",
                    roomType: "bedchamber",
                    associations: [
                        { anchor: "bed", memorableItem: "Milk", description: "Fresh dairy for the week" },
                        { anchor: "lamp", memorableItem: "Bread", description: "Fresh loaf for sandwiches" },
                        { anchor: "mirror", memorableItem: "Eggs", description: "Dozen eggs for breakfast" },
                        { anchor: "window", memorableItem: "Apples", description: "Fresh fruit for snacks" },
                        { anchor: "dresser", memorableItem: "Chicken", description: "Protein for meals" },
                        { anchor: "nightstand", memorableItem: "Coffee", description: "Morning brew essentials" },
                        { anchor: "wardrobe", memorableItem: "Pasta", description: "Quick dinner option" }
                    ]
                },
                {
                    name: "Today's To-Do List",
                    roomType: "throne room",
                    associations: [
                        { anchor: "throne", memorableItem: "Call Mom", description: "Check in with family" },
                        { anchor: "chandelier", memorableItem: "Pay Bills", description: "Handle monthly payments" },
                        { anchor: "stained glass window", memorableItem: "Gym", description: "Evening workout session" },
                        { anchor: "statue", memorableItem: "Meeting", description: "Team sync at 2 PM" },
                        { anchor: "red carpet", memorableItem: "Dinner", description: "Reservation at 7 PM" },
                        { anchor: "footstool", memorableItem: "Laundry", description: "Wash workout clothes" },
                        { anchor: "candlestick", memorableItem: "Study", description: "Review for exam" }
                    ]
                },
                {
                    name: "Weekly Schedule",
                    roomType: "dungeon",
                    associations: [
                        { anchor: "gate", memorableItem: "Coffee Meeting", description: "Monday morning coffee with team" },
                        { anchor: "table", memorableItem: "Yoga Mat", description: "Tuesday evening yoga class" },
                        { anchor: "pillory", memorableItem: "Book Stack", description: "Wednesday book club" },
                        { anchor: "bookshelf", memorableItem: "Toothbrush", description: "Thursday dentist appointment" },
                        { anchor: "barrel", memorableItem: "Popcorn", description: "Friday movie night" },
                        { anchor: "hanging chains", memorableItem: "Shopping Cart", description: "Saturday grocery shopping" },
                        { anchor: "sconce", memorableItem: "Family Photo", description: "Sunday family dinner" }
                    ]
                }
            ];
            localStorage.setItem('savedRooms', JSON.stringify(seedData));
            setPalaces(seedData);
            setLoading(false);
            return;
        }

        // For real users, decode token and fetch from API
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUserEmail(payload.email);
            fetchPalaces();
        } catch (err) {
            console.error('Error decoding token:', err);
            const tokenError = new Error('Invalid authentication token');
            tokenError.response = { status: 401 };
            setError(tokenError);
            setLoading(false);
        }
    }, [navigate]);

    const fetchPalaces = async () => {
        try {
            const response = await fetch(`${API_URL}/api/memory-palaces`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

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

    const handlePalaceClick = (palace) => {
        // Store the complete palace data in localStorage
        localStorage.setItem('currentPalace', JSON.stringify(palace));
        showInfo(`Loading memory palace "${palace.name}"...`);
        navigate('/visualizer');
    };

    const handleDeleteClick = (e, palace) => {
        e.stopPropagation();
        setPalaceToDelete(palace);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (localStorage.getItem('token') === 'demo-token') {
            // For demo mode, remove from localStorage
            const updatedPalaces = palaces.filter(p =>
                p.name !== palaceToDelete.name || p.roomType !== palaceToDelete.roomType
            );
            localStorage.setItem('savedRooms', JSON.stringify(updatedPalaces));
            setPalaces(updatedPalaces);
            showSuccess(`Memory palace "${palaceToDelete.name}" deleted successfully!`);
        } else {
            // For real users, delete from API
            try {
                const response = await fetch(`${API_URL}/api/memory-palaces/${palaceToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
                });

                if (!response.ok) {
                    const data = await response.json();
                    const errorObj = new Error(data.message || 'Failed to delete memory palace');
                    errorObj.response = { data, status: response.status };
                    throw errorObj;
                }

                setPalaces(palaces.filter(p => p._id !== palaceToDelete._id));
                showSuccess(`Memory palace "${palaceToDelete.name}" deleted successfully!`);
            } catch (err) {
                setError(err);
                showError('Failed to delete memory palace. Please try again.');
            }
        }
        setDeleteModalOpen(false);
        setPalaceToDelete(null);
    };

    const handleCancelDelete = () => {
        setDeleteModalOpen(false);
        setPalaceToDelete(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleRetryLoad = () => {
        setError(null);
        setLoading(true);
        fetchPalaces();
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
        <div className="min-h-screen bg-gradient-to-b from-[#DAA520]/60 via-[#FFD700]/40 to-white">
            <NavBar onLogout={handleLogout} />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6 text-center">
                    {userEmail === 'demo@example.com' ? 'Demo Memory Palaces' : 'Your Memory Palaces'}
                </h1>

                {error && (
                    <div className="mb-6">
                        <ErrorMessage
                            error={error}
                            context="palace-load"
                            onRetry={handleRetryLoad}
                        />
                    </div>
                )}

                {palaces.length === 0 ? (
                    <div className="text-center text-gray-600 mt-8">
                        <p className="text-lg mb-4">No memory palaces found.</p>
                        {userEmail !== 'demo@example.com' && (
                            <button
                                onClick={() => navigate('/demo')}
                                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-300"
                            >
                                Create Your First Palace
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {palaces.map((palace) => (
                            <div
                                key={palace._id || palace.name}
                                onClick={() => handlePalaceClick(palace)}
                                className="bg-white/90 p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300 relative"
                            >
                                <button
                                    onClick={(e) => handleDeleteClick(e, palace)}
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-2"
                                    title="Delete memory palace"
                                >
                                    ×
                                </button>
                                <h2 className="text-xl font-semibold mb-2">{palace.name}</h2>
                                <p className="text-gray-600 mb-4">Room Type: {palace.roomType || 'Throne Room'}</p>
                                <div className="space-y-2">
                                    {palace.associations && palace.associations.map((assoc, index) => (
                                        <div key={index} className="border-t pt-2">
                                            <p className="font-medium">{assoc.memorableItem}</p>
                                            <p className="text-sm text-gray-500">Anchor: {assoc.anchor}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-xl font-semibold mb-4">Delete Memory Palace</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete "{palaceToDelete?.name}"? This action cannot be undone.
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
        </div>
    );
};

export default SavedRooms;
