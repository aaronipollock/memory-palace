import React from 'react';

const MemoryPalace = ({ associations = [] }) => {
    if (associations.length === 0) {
        return <p>No associations to display. Please generate some first.</p>;
    }

    return (
        <div className="memory-palace-container">
            <div className="memory-palace-header">
                <h3>Your Memory Palace Journey</h3>
                <p>Follow the path from left to right to review your associations</p>
            </div>
            <div className="memory-palace-path">
                {associations.map((association, index) => (
                    <div key={index} className="memory-station">
                        <div className="station-number">{index + 1}</div>
                        <div className="station-content">
                            <div className="image-container">
                                <img
                                    src={association.url}
                                    alt={association.prompt}
                                    loading="lazy"
                                />
                            </div>
                            <div className="station-details">
                                <div className="location">
                                    <span className="label">Location:</span>
                                    <span className="value">{association.roomFeature}</span>
                                </div>
                                <div className="memorable">
                                    <span className="label">Remember:</span>
                                    <span className="value">{association.item}</span>
                                </div>
                                <p className="association-description">{association.prompt}</p>
                            </div>
                        </div>
                        {index < associations.length - 1 && <div className="path-connector">→</div>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MemoryPalace;
