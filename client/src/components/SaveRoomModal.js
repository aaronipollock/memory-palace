import React, { useState, useEffect, useRef } from 'react';

const SaveRoomModal = ({ isOpen, onClose, onSave, acceptedImages, roomType }) => {
    const [roomName, setRoomName] = useState('');
    const [error, setError] = useState('');
    const modalRef = useRef(null);
    const inputRef = useRef(null);

    // Focus trap and Escape key support
    useEffect(() => {
        if (!isOpen) return;
        const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        function handleKeyDown(e) {
            if (e.key === 'Escape') {
                onClose();
            }
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        // Focus the input
        if (inputRef.current) {
            inputRef.current.focus();
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

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
            <div
                className="bg-white rounded-lg p-6 max-w-md w-full mario-castle"
                role="dialog"
                aria-modal="true"
                aria-labelledby="save-room-modal-title"
                aria-describedby="save-room-modal-desc"
                ref={modalRef}
            >
                <h2 className="text-2xl font-bold mb-4 text-primary" id="save-room-modal-title">Save Your Room</h2>
                <div id="save-room-modal-desc" className="sr-only">
                    Enter a name for your memory room to save it for later use.
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="room-name" className="block text-sm font-medium text-gray-700 mb-1">
                            Room Name
                        </label>
                        <input
                            type="text"
                            id="room-name"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            className="w-full p-2 border-2 border-accent1 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none focus-visible:ring-2 focus-visible:ring-accent1"
                            placeholder="Enter a name for your room"
                            ref={inputRef}
                            aria-describedby={error ? "room-name-error" : undefined}
                        />
                        {error && <p id="room-name-error" className="text-red-500 text-sm mt-1" aria-live="assertive">{error}</p>}
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent1"
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
