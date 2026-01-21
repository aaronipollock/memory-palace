import React, { useState } from 'react';
import { getApiUrl } from '../config/api';

// Helper function to resolve image URLs (handle relative and localhost URLs)
const resolveImageUrl = (url) => {
    if (!url) return null;

    // If it's a relative path, prefix with backend URL
    if (url.startsWith('/')) {
        const backendUrl = getApiUrl('').replace(/\/$/, '');
        return `${backendUrl}${url}`;
    }

    // If it contains localhost, replace with backend URL
    if (url.includes('localhost')) {
        const backendUrl = getApiUrl('').replace(/\/$/, '');
        // Match and replace the entire origin (protocol + host + port)
        return url.replace(/https?:\/\/[^\/:]+(?::\d+)?/, backendUrl);
    }

    // Otherwise return as-is (should be a full URL)
    return url;
};

const Gallery = ({ images = [] }) => {
    const [feedback, setFeedBack] = useState({});

    const handleFeedback = (index, type) => {
        setFeedBack(prevFeedback => ({
            ...prevFeedback,
            [index]: type
        }));
    };

    if (images.length === 0) {
        return null; // Don't render anything if there are no images
    }

    return (
        <div className="gallery-container">
            {images.map((image, index) => {
                // Resolve image URL for display
                const imageUrl = image.imageData
                    ? `data:image/png;base64,${image.imageData}`
                    : resolveImageUrl(image.optimizedUrl || image.imageUrl);

                // Resolve fallback URL
                const fallbackUrl = image.imageData
                    ? `data:image/png;base64,${image.imageData}`
                    : resolveImageUrl(image.originalUrl);

                return (
                <div key={index} className="gallery-item">
                    <div className="image-container">
                        <img
                            src={imageUrl}
                            alt={image.prompt || `Generated image ${index + 1}`}
                            loading="lazy"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = fallbackUrl || '/images/placeholder.png';
                            }}
                        />
                    </div>
                    <div className="image-details">
                        <div className='association'>
                            <span className='item'>{image.item}</span>
                            <span className='plus'>+</span>
                            <span className='feature'>{image.roomFeature}</span>
                        </div>
                        <p className='prompt'>{image.prompt}</p>
                        <div className='feedback-buttons'>
                            <button
                                className={`like-button ${feedback[index] === 'like' ? 'active' : ''}`}
                                onClick={() => handleFeedback(index, 'like')}
                            >
                                👍 Like
                            </button>
                            <button
                                className={`dislike-button ${feedback[index] === 'dislike' ? 'active' : ''}`}
                                onClick={() => handleFeedback(index, 'dislike')}
                            >
                                👎 Dislike
                            </button>
                        </div>
                    </div>
                </div>
                );
            })}
        </div>
    );
};

export default Gallery;
