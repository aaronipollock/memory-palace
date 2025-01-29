import React from 'react';

const MemoryPalace = ({ associations = [] }) => {
    if (associations.length === 0) {
        return (
            <p className="text-text text-center p-6">
                No associations to display. Please generate some first.
            </p>
        );
    }

    return (
        <div className="p-8 bg-surface rounded-lg shadow-lg">
            <div className="text-center mb-8">
                <h3 className="text-2xl text-primary font-bold mb-2">Your Memory Palace Journey</h3>
                <p className="text-text">Follow the path from left to right to review your associations</p>
            </div>
            <div className="space-y-8">
                {associations.map((association, index) => (
                    <div key={index} className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary text-background rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                        </div>
                        <div className="flex-grow bg-background rounded-lg overflow-hidden">
                            <div className="flex gap-4 p-4">
                                <div className="w-48 h-48 flex-shrink-0">
                                    <img
                                        src={association.url}
                                        alt={association.prompt}
                                        className="w-full h-full object-cover rounded-lg"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="flex-grow space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-primary font-bold">Location:</span>
                                            <span className="text-text">{association.roomFeature}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-primary font-bold">Remember:</span>
                                            <span className="text-text">{association.item}</span>
                                        </div>
                                    </div>
                                    <p className="text-text italic">{association.prompt}</p>
                                </div>
                            </div>
                        </div>
                        {index < associations.length - 1 && (
                            <div className="text-primary text-2xl">→</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MemoryPalace;
