import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import './ImagePopup.css';

const ImagePopup = ({
  association,
  image,
  prompt,
  isLoading,
  error,
  onClose,
  onAccept,
  onReject
}) => {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div
        className="popup-content"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-primary hover:text-accent w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200"
        >
          ×
        </button>

        <h3 className="loci-header text-xl mb-3 text-primary">
          {association.anchor} + {association.memorableItem}
        </h3>

        {/* {association.description && (
          <div className="text-sm text-text-light mb-4 bg-background p-3 rounded-lg">
            <span className="font-semibold text-primary">Memory Aid:</span> {association.description}
          </div>
        )} */}

        {prompt && !isLoading && image && (
          <div className="text-xs text-text-light italic mb-3 bg-background p-3 rounded-lg">
            <span className="font-semibold text-primary">AI Prompt:</span> {prompt}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-6">
            <LoadingSpinner size="lg" text="Creating your memorable image..." />
          </div>
        )}

        {error && (
          <div className="text-error text-center py-3 bg-error/10 rounded-lg">
            {error}
          </div>
        )}

        {image && (
          <div className="mt-4">
            <img
              src={image}
              alt={`${association.memorable} with ${association.anchor}`}
              className="rounded-lg shadow-md max-w-full h-auto loci-fade-in"
              onError={(e) => {
                console.error('Image failed to load:', e);
              }}
            />

            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={onReject}
                className="btn-loci bg-secondary text-primary"
              >
                Reject
              </button>
              <button
                onClick={onAccept}
                className="btn-loci"
              >
                Accept
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePopup;
