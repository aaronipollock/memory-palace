import React from 'react';

const Gallery = ({ images }) => {
    return (
        <div>
            <h2>Generated Images</h2>
            <div className="gallery">
                {images.map((image, index) => (
                    <img key={index} src={image.url} alt={image.prompt} />
                ))}
            </div>
        </div>
    );
};

export default Gallery;
