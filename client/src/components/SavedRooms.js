import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';

const API_URL = 'http://localhost:5000';

const SavedRooms = () => {
    const [palaces, setPalaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userEmail, setUserEmail] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        // Decode token to get user email
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUserEmail(payload.email);
            if (payload.email === 'demo@example.com') {
                // Load from localStorage for demo user
                const localPalaces = JSON.parse(localStorage.getItem('savedRooms') || '[]');
                setPalaces(localPalaces);
                setLoading(false);
                return;
            }
        } catch (err) {
            console.error('Error decoding token:', err);
            navigate('/');
            return;
        }

        fetchPalaces();
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
                throw new Error('Failed to fetch memory palaces');
            }

            const data = await response.json();
            setPalaces(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePalaceClick = (palace) => {
        // Store the complete palace data in localStorage
        localStorage.setItem('currentPalace', JSON.stringify(palace));
        navigate('/visualizer');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <NavBar onLogout={handleLogout} />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">Loading...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background">
                <NavBar onLogout={handleLogout} />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-red-500 text-center">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <NavBar onLogout={handleLogout} />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6 text-center">
                    {userEmail === 'demo@example.com' ? 'Demo Memory Palaces' : 'Your Memory Palaces'}
                </h1>

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
                                key={palace._id}
                                onClick={() => handlePalaceClick(palace)}
                                className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300"
                            >
                                <h2 className="text-xl font-semibold mb-2">{palace.name}</h2>
                                <p className="text-gray-600 mb-4">Room Type: {palace.roomType}</p>
                                <div className="space-y-2">
                                    {palace.associations.map((assoc, index) => (
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

                {userEmail !== 'demo@example.com' && (
                    <div className="text-center mt-8">
                        <button
                            onClick={() => navigate('/demo')}
                            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-300"
                        >
                            Create New Palace
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedRooms;
