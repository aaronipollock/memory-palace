import React, { useState } from 'react';

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
            {images.map((image, index) => (
                <div key={index} className="gallery-item">
                    <div className="image-container">
                        <img
                            src={image.optimizedUrl || image.imageUrl}
                            alt={image.prompt || `Generated image ${index + 1}`}
                            loading="lazy"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = image.originalUrl; // Fallback to original
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
            ))}
        </div>
    );
};

export default Gallery;
