import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';

const SavedRooms = () => {
    const [savedRooms, setSavedRooms] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const rooms = localStorage.getItem('savedRooms');
        if (rooms) {
            setSavedRooms(JSON.parse(rooms));
        }
    }, []);

    const handleDeleteRoom = (roomName) => {
        const updatedRooms = savedRooms.filter(room => room.name !== roomName);
        setSavedRooms(updatedRooms);
        localStorage.setItem('savedRooms', JSON.stringify(updatedRooms));
    };

    const handleViewRoom = (room) => {
        // Store the room data in localStorage for the visualizer to use
        localStorage.setItem('currentRoom', JSON.stringify(room));
        navigate('/visualizer');
    };

    return (
        <div className="min-h-screen bg-background">
            <NavBar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6 text-center">Your Saved Memory Rooms</h1>

                {savedRooms.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-xl text-gray-600">No saved rooms yet. Create and save a room to see it here!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedRooms.map((room, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden mario-castle">
                                <div className="p-6">
                                    <h2 className="text-xl font-bold mb-2 text-primary">{room.name}</h2>
                                    <p className="text-gray-600 mb-4">Type: {room.type}</p>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Created: {new Date(room.createdAt).toLocaleDateString()}
                                    </p>

                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        {Object.entries(room.images).map(([anchor, data]) => (
                                            <div key={anchor} className="text-sm">
                                                <p className="font-medium">{anchor}</p>
                                                <p className="text-gray-600 truncate">{data.association.memorable}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between">
                                        <button
                                            onClick={() => handleViewRoom(room)}
                                            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors duration-200"
                                        >
                                            View Room
                                        </button>
                                        <button
                                            onClick={() => handleDeleteRoom(room.name)}
                                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedRooms;
