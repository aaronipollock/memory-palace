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
      artStyle: 'Random',
    },
  });

  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  // Preload user data when user prop is available or modal opens
  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          username: user.username || '',
          preferences: {
            room: user.preferences?.room || 'throne room',
            artStyle: user.preferences?.artStyle || 'Random',
          },
        });
      } else {
        // Reset form if user data is not available
        setFormData({
          firstName: '',
          lastName: '',
          username: '',
          preferences: {
            room: 'throne room',
            artStyle: 'Random',
          },
        });
      }
    }
  }, [user, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Only send fields that have values (filter out empty strings)
      const payload = {
        preferences: formData.preferences,
      };

      if (formData.firstName && formData.firstName.trim()) {
        payload.firstName = formData.firstName.trim();
      }

      if (formData.lastName && formData.lastName.trim()) {
        payload.lastName = formData.lastName.trim();
      }

      // Username can be set or cleared (empty string clears it)
      if (formData.username !== undefined) {
        payload.username = formData.username.trim() || null;
      }

      const response = await apiClient.put('/api/user/profile', payload);

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
      setFormData((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-3xl leading-none w-8 h-8 flex items-center justify-center"
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 pr-8">Profile Settings</h2>

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
              <option value="Realistic">Realistic</option>
              <option value="Cartoon">Cartoon</option>
              <option value="Fantasy">Fantasy</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-[#7C3AED] transition-colors disabled:opacity-70"
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
