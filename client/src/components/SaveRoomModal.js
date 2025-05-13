import React, { useState } from 'react';

const SaveRoomModal = ({ isOpen, onClose, onSave, acceptedImages, roomType }) => {
    const [roomName, setRoomName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!roomName.trim()) {
            setError('Please enter a room name');
            return;
        }

        // Create the room data object
        const roomData = {
            name: roomName.trim(),
            type: roomType,
            images: acceptedImages,
            createdAt: new Date().toISOString()
        };

        onSave(roomData);
        setRoomName('');
        setError('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mario-castle">
                <h2 className="text-2xl font-bold mb-4 text-primary">Save Your Memory Room</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Room Name
                        </label>
                        <input
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            className="w-full p-2 border-2 border-accent1 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            placeholder="Enter a name for your room"
                        />
                        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors duration-200"
                        >
                            Save Room
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SaveRoomModal;
