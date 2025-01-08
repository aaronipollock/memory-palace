import React from 'react';

const Gallery = ({ images }) => {
    return (
        <div>
            <h2>Generated Images</h2>
            <div style={{ display: 'flex', flexwrap: 'wrap' }}>
                {images.map((images, index) => (
                    <div key={index} style={{ margin: '10px' }}>
                        <img src={image.url} alt={image.prompt} style={{ width: '200px', height: 'auto'}} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Gallery;
