import React from 'react';
import App from '../App';

const Gallery = ({ images = [] }) => {
    if (images.length === 0) {
        return null; // Don't render anything if there are no images
    }

    return (
        <div className="gallery-container">
            {images.map((image, index) => (
                <div key={index} className="gallery-item">
                    <div className="image-container">
                        <img
                            src={image.url}
                            alt={image.prompt || `Generated image ${index + 1}`}
                            loading="lazy"
                        />
                    </div>
                    <div className="image-details">
                        <div className='association'>
                            <span className='item'>{image.item}</span>
                            <span className='plus'>+</span>
                            <span className='feature'>{image.roomFeature}</span>
                        </div>
                        <p className='prompt'>{image.prompt}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Gallery;
