import React from 'react';

const Gallery = ({ images = [] }) => {
    if (images.length === 0) {
        return null; // Don't render anything if there are no images
    }

    return (
        <div className="gallery-container">
            {images.map((image, index) => (
                <div key={index} className="gallery-item">
                    <img
                        src={image.url}
                        alt={image.prompt || `Generated image ${index + 1}`}
                    />
                </div>
            ))}
        </div>
    );
};

export default Gallery;
