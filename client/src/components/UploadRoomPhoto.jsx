import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { SecureAPIClient } from '../utils/security';
import { getApiUrl } from '../config/api';

const apiClient = new SecureAPIClient(getApiUrl(''));

// Upload Room Photo Modal - allows users to upload room images, add name/description, and create custom rooms

const UploadRoomPhoto = ({ isOpen, onClose, onSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null); // Base64 string for preview
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const modalRef = useRef(null);
    const firstInputRef = useRef(null);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedFile(null);
            setImagePreview(null);
            setFormData({ name: '', description: '' });
            setError(null);
            setIsDragging(false);
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

    // Validates and processes file (from input or drag-and-drop), converts to base64 for preview
    const processFile = (file) => {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError('Image must be less than 10MB');
            return;
        }

        setSelectedFile(file);
        setError(null);

        const reader = new FileReader();
        reader.onload = (event) => {
            setImagePreview(event.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e) => {
        processFile(e.target.files[0]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Only remove dragging state if leaving drop zone (not entering a child)
        if (e.currentTarget === e.target) {
            setIsDragging(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Uploads image, creates custom room, and navigates to anchor point editor
    const handleSubmit = async (e) => {
        e.preventDefault();

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
            // Upload image file to get URL (avoids storing base64 in database)
            const formDataToUpload = new FormData();
            formDataToUpload.append('image', selectedFile);

            const uploadResponse = await fetch(`${getApiUrl('')}/api/upload-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'X-CSRF-Token': localStorage.getItem('csrfToken') || ''
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

            // Create custom room with the image URL
            const response = await apiClient.post('/api/custom-rooms', {
                name: formData.name.trim(),
                description: formData.description.trim(),
                imageUrl: imageUrl,
                anchorPoints: []
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create room');
            }

            const room = await response.json();
            showSuccess('Room created successfully!');

            if (onSuccess) {
                onSuccess(room);
            }

            onClose();
            navigate(`/custom-rooms/${room._id}/edit`);

        } catch (err) {
            console.error('Error creating room:', err);
            setError(err.message || 'Failed to create room');
            showError(err.message || 'Failed to create room');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4"
            onClick={(e) => {
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
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Room Photo *
                        </label>
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`
                                relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
                                ${isDragging
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                                }
                                ${selectedFile ? 'border-green-300 bg-green-50' : ''}
                            `}
                        >
                            {imagePreview ? (
                                <div className="space-y-4">
                                    <img
                                        src={imagePreview}
                                        alt="Room preview"
                                        className="max-w-full h-auto rounded-lg mx-auto block"
                                        style={{ maxHeight: '200px' }}
                                    />
                                    <div className="text-sm text-gray-600">
                                        <p className="font-medium text-green-700">Image selected: {selectedFile.name}</p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedFile(null);
                                                setImagePreview(null);
                                            }}
                                            className="mt-2 text-primary hover:text-primary-dark underline"
                                        >
                                            Change image
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex flex-col items-center">
                                        <svg
                                            className="w-12 h-12 text-gray-400 mb-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                            />
                                        </svg>
                                        <p className="text-lg font-medium text-gray-700 mb-2">
                                            {isDragging ? 'Drop your image here' : 'Drag and drop your image here'}
                                        </p>
                                        <p className="text-sm text-gray-500 mb-4">or</p>
                                        <label className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-[#7C3AED] cursor-pointer transition-colors">
                                            <svg
                                                className="w-5 h-5 mr-2"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 4v16m8-8H4"
                                                />
                                            </svg>
                                            Browse Files
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </label>
                                        <p className="text-xs text-gray-500 mt-4">
                                            Supported formats: JPG, PNG, GIF, WEBP (max 10MB)
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>


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
