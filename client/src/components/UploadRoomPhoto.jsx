import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { SecureAPIClient } from '../utils/security';
import { getApiUrl } from '../config/api';

const apiClient = new SecureAPIClient(getApiUrl(''));

/**
 * 🎓 COMPONENT: Upload Room Photo Modal
 *
 * WHAT THIS COMPONENT DOES:
 * - Lets users upload a photo of a real room
 * - Shows a preview of the selected image
 * - Allows users to name and describe the room
 * - Saves the room to the database
 *
 * KEY CONCEPTS:
 * 1. File input and FileReader API
 * 2. Image preview using base64
 * 3. Form state management
 * 4. API calls to create room
 * 5. Modal with focus trap and keyboard navigation
 */

const UploadRoomPhoto = ({ isOpen, onClose, onSuccess }) => {
    // 🎯 STATE MANAGEMENT
    // These variables store data that can change (React calls this "state")

    // Store the selected file
    const [selectedFile, setSelectedFile] = useState(null);

    // Store the image preview (as base64 string)
    // This is what we'll display in the <img> tag
    const [imagePreview, setImagePreview] = useState(null);

    // Store form data (name and description)
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    // Track if we're currently saving (to show loading spinner)
    const [isLoading, setIsLoading] = useState(false);

    // Store any error messages
    const [error, setError] = useState(null);

    // React Router hook to navigate to different pages
    const navigate = useNavigate();

    // Toast notifications (success/error messages)
    const { showSuccess, showError } = useToast();

    // Modal refs for focus trap
    const modalRef = useRef(null);
    const firstInputRef = useRef(null);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            // Reset form when modal closes
            setSelectedFile(null);
            setImagePreview(null);
            setFormData({ name: '', description: '' });
            setError(null);
        }
    }, [isOpen]);

    // Focus trap and Escape key support
    useEffect(() => {
        if (!isOpen) return;
        const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

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
        // Focus the first input
        if (firstInputRef.current) {
            setTimeout(() => firstInputRef.current.focus(), 100);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    /**
     * 📖 FUNCTION: handleFileChange
     *
     * WHAT IT DOES:
     * - Called when user selects a file
     * - Reads the file and converts it to base64
     * - Sets the preview so user can see the image
     *
     * HOW IT WORKS:
     * 1. User clicks file input and selects an image
     * 2. Browser gives us a File object in e.target.files[0]
     * 3. We create a FileReader to read the file
     * 4. FileReader converts file to base64 string
     * 5. We store both the file and the base64 preview
     */
    const handleFileChange = (e) => {
        const file = e.target.files[0]; // Get the first selected file

        if (!file) {
            return; // No file selected
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('Image must be less than 10MB');
            return;
        }

        // Store the file
        setSelectedFile(file);
        setError(null); // Clear any previous errors

        // 📖 FILEREADER API EXPLANATION:
        // FileReader is a browser API that reads files
        // readAsDataURL converts the file to a base64 string
        // This string can be used as the src of an <img> tag

        const reader = new FileReader();

        // This function runs when the file is done reading
        reader.onload = (event) => {
            // event.target.result contains the base64 string
            // It looks like: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
            const base64String = event.target.result;
            setImagePreview(base64String);
        };

        // Start reading the file
        reader.readAsDataURL(file);
    };

    /**
     * 📖 FUNCTION: handleInputChange
     *
     * WHAT IT DOES:
     * - Updates form data when user types in name/description fields
     *
     * HOW IT WORKS:
     * - e.target.name = the input's name attribute ("name" or "description")
     * - e.target.value = what the user typed
     * - We update the formData state with the new value
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    /**
     * 📖 FUNCTION: handleSubmit
     *
     * WHAT IT DOES:
     * - Validates the form
     * - Creates the custom room in the database
     * - Navigates to the anchor point editor
     *
     * HOW IT WORKS:
     * 1. Check if all required fields are filled
     * 2. Show loading spinner
     * 3. Send POST request to API
     * 4. If successful, navigate to edit page
     * 5. If error, show error message
     */
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent page refresh

        // Validation
        if (!selectedFile) {
            setError('Please select an image');
            return;
        }

        if (!formData.name.trim()) {
            setError('Please enter a room name');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // 📖 STEP 1: UPLOAD THE IMAGE FILE
            // First, we upload the file to get a URL
            // This avoids storing huge base64 strings in the database

            // Validate file is selected
            if (!selectedFile) {
                throw new Error('No file selected');
            }

            const formDataToUpload = new FormData();
            formDataToUpload.append('image', selectedFile);

            // Upload the image file
            // NOTE: Don't set Content-Type header - browser will set it automatically with boundary
            const uploadResponse = await fetch(`${getApiUrl('')}/api/upload-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'X-CSRF-Token': localStorage.getItem('csrfToken') || ''
                    // Don't set Content-Type - browser will set it automatically for FormData
                },
                credentials: 'include',
                body: formDataToUpload
            });

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json();
                console.error('Upload error:', errorData);
                throw new Error(errorData.error || 'Failed to upload image');
            }

            const uploadData = await uploadResponse.json();
            const imageUrl = uploadData.originalUrl || uploadData.optimizedUrl;

            if (!imageUrl) {
                throw new Error('No image URL returned from upload');
            }

            // 📖 STEP 2: CREATE THE CUSTOM ROOM WITH THE URL
            // Now we create the room using the URL (which is < 500 characters)
            const response = await apiClient.post('/api/custom-rooms', {
                name: formData.name.trim(),
                description: formData.description.trim(),
                imageUrl: imageUrl, // Use the URL from the upload
                anchorPoints: [] // Start with no anchor points
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create room');
            }

            const room = await response.json();

            // Show success message
            showSuccess('Room created successfully!');

            // Call onSuccess callback if provided (to refresh custom rooms list)
            if (onSuccess) {
                onSuccess(room);
            }

            // Close modal
            onClose();

            // Navigate to anchor point editor
            // We pass the room ID in the URL
            navigate(`/custom-rooms/${room._id}/edit`);

        } catch (err) {
            console.error('Error creating room:', err);
            setError(err.message || 'Failed to create room');
            showError(err.message || 'Failed to create room');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * 📖 THE JSX (WHAT GETS RENDERED):
     *
     * This is what the user sees in the modal
     * - Modal overlay with backdrop
     * - Form with file input, name, description
     * - Image preview
     * - Submit button
     * - Loading spinner (when saving)
     * - Error message (if something goes wrong)
     */
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4"
            onClick={(e) => {
                // Close modal when clicking backdrop
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-auto"
                role="dialog"
                aria-modal="true"
                aria-labelledby="upload-room-modal-title"
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold" id="upload-room-modal-title">
                            Create Custom Room
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                            aria-label="Close modal"
                        >
                            ×
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                    {/* FILE INPUT SECTION */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Room Photo *
                        </label>

                        {/* 📖 FILE INPUT EXPLANATION:
                            - type="file" creates a file picker button
                            - accept="image/*" only allows image files
                            - onChange calls handleFileChange when user selects a file
                        */}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500
                                     file:mr-4 file:py-2 file:px-4
                                     file:rounded-full file:border-0
                                     file:text-sm file:font-semibold
                                     file:bg-blue-50 file:text-blue-700
                                     hover:file:bg-blue-100"
                        />

                        <p className="mt-2 text-sm text-gray-500">
                            Select an image file (max 10MB)
                        </p>
                    </div>

                    {/* IMAGE PREVIEW SECTION */}
                    {imagePreview && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Preview
                            </label>

                            {/* 📖 IMAGE PREVIEW EXPLANATION:
                                - We use the base64 string as the src
                                - Browser automatically displays it
                                - max-w-full ensures it doesn't overflow
                            */}
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 inline-block">
                                <img
                                    src={imagePreview}
                                    alt="Room preview"
                                    className="max-w-full h-auto rounded-lg block"
                                    style={{ maxHeight: '400px' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* NAME INPUT */}
                    <div className="mb-6">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Room Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g., My Bedroom, Kitchen, Office"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                            ref={firstInputRef}
                        />
                    </div>

                    {/* DESCRIPTION TEXTAREA */}
                    <div className="mb-6">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Add a description of this room..."
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* ERROR MESSAGE */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}

                        {/* SUBMIT BUTTON */}
                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !selectedFile || !formData.name.trim()}
                                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-[#7C3AED] disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <LoadingSpinner size="small" />
                                        Creating...
                                    </span>
                                ) : (
                                    'Create Room'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UploadRoomPhoto;
