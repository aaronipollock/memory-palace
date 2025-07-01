import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import OptimizedImage from './OptimizedImage';
import './ImagePopup.css';

const ImagePopup = ({
  association,
  image,
  optimized,
  srcSet,
  prompt,
  isLoading,
  error,
  onClose,
  onAccept,
  onReject,
  onRetry
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
          <div className="mb-4">
            <ErrorMessage
              error={error}
              context="image-generation"
              onRetry={onRetry}
            />
          </div>
        )}

        {image && (
          <div className="mt-4">
            <OptimizedImage
              src={image}
              optimized={optimized}
              srcSet={srcSet}
              alt={`${association.memorableItem} with ${association.anchor}`}
              className="rounded-lg shadow-md max-w-full h-auto loci-fade-in"
              sizes="(max-width: 768px) 90vw, (max-width: 1200px) 70vw, 50vw"
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
