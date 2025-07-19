import React, { useEffect, useRef } from 'react';
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
  const popupRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Focus trap and Escape key support
  useEffect(() => {
    const focusableElements = popupRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    // Focus the close button
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  console.log('ImagePopup rendered');

  return (
    <div
      className="popup-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-popup-title"
      aria-describedby="image-popup-desc"
    >
      <div
        className="popup-content"
        onClick={e => e.stopPropagation()}
        ref={popupRef}
      >
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute top-3 right-3 text-primary hover:text-accent w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent1"
          aria-label="Close image popup"
        >
          ×
        </button>

        <h3 className="loci-header text-xl mb-3 text-primary" id="image-popup-title">
          {association.anchor} + {association.memorableItem}
        </h3>

        <div id="image-popup-desc" className="sr-only">
          Generated image for {association.memorableItem} at {association.anchor} location.
        </div>

        {prompt && !isLoading && image && (
          <div className="text-xs text-text-light italic mb-3 bg-background p-3 rounded-lg" aria-live="polite">
            <span className="font-semibold text-primary">AI Prompt:</span> {prompt}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-6" aria-live="assertive">
            <LoadingSpinner size="lg" text="Creating your memorable image..." />
          </div>
        )}

        {error && (
          <div className="mb-4" aria-live="assertive">
            <ErrorMessage
              error={error}
              context="image-generation"
              onRetry={onRetry}
            />
          </div>
        )}

        {image && (
          <div className="mt-4" aria-live="polite">
            <OptimizedImage
              src={image}
              optimized={true}
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
                className="btn-loci bg-secondary text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent1"
                aria-describedby="reject-help"
              >
                Reject
              </button>
              <div id="reject-help" className="sr-only">
                Click to generate a new image for this anchor point.
              </div>
              <button
                onClick={onAccept}
                className="btn-loci focus:outline-none focus-visible:ring-2 focus-visible:ring-accent1"
                aria-describedby="accept-help"
              >
                Accept
              </button>
              <div id="accept-help" className="sr-only">
                Click to accept this image for the {association.anchor} anchor point.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePopup;
