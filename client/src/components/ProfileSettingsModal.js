import React, { useState, useEffect } from 'react';
import { SecureAPIClient } from '../utils/security';
import { getApiUrl } from '../config/api';
import { useToast } from '../context/ToastContext';

const apiClient = new SecureAPIClient(getApiUrl(''));

const ProfileSettingsModal = ({ isOpen, onClose, user, onProfileUpdate }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        preferences: {
            room: 'throne room',
            artStyle: 'Random'
        }
    });
    const [loading, setLoading] = useState(false);
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        if (user && isOpen) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                username: user.username || '',
                preferences: {
                    room: user.preferences?.room || 'throne room',
                    artStyle: user.preferences?.artStyle || 'Random'
                }
            });
        }
    }, [user, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await apiClient.put('/api/user/profile', formData);

            if (response.ok) {
                const updatedUser = await response.json();
                showSuccess('Profile updated successfully!');
                onProfileUpdate(updatedUser.user);
                onClose();
            } else {
                const errorData = await response.json();
                showError(errorData.error || 'Failed to update profile');
            }
        } catch (err) {
            showError('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('preferences.')) {
            const prefKey = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                preferences: {
                    ...prev.preferences,
                    [prefKey]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name
                        </label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name
                        </label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Preferred Room Type
                        </label>
                        <select
                            name="preferences.room"
                            value={formData.preferences.room}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="throne room">Throne Room</option>
                            <option value="bedchamber">Bedchamber</option>
                            <option value="dungeon">Dungeon</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Preferred Art Style
                        </label>
                        <select
                            name="preferences.artStyle"
                            value={formData.preferences.artStyle}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Random">Random</option>
                            <option value="Digital Art">Digital Art</option>
                            <option value="Cartoon">Cartoon</option>
                            <option value="3D Render">3D Render</option>
                            <option value="Watercolor">Watercolor</option>
                            <option value="Pop Art">Pop Art</option>
                            <option value="Photorealistic">Photorealistic</option>
                        </select>
                    </div>

                    <div className="flex space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileSettingsModal;
