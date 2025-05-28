import React from 'react';

const ImagePopup = ({
  association,
  position,
  image,
  prompt,
  isLoading,
  error,
  onClose,
  onAccept,
  onReject
}) => {
  return (
    <div
      className="fixed loci-modal p-6 z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: position.transform || 'translate(-50%, -120%)',
        maxWidth: '400px',
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-primary hover:text-accent w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200"
      >
        ×
      </button>

      <h3 className="loci-header text-xl mb-3 text-primary">
        {association.anchor}: {association.memorable}
      </h3>

      {association.description && (
        <div className="text-sm text-text-light mb-4 bg-background p-3 rounded-lg">
          <span className="font-semibold text-primary">Memory Aid:</span> {association.description}
        </div>
      )}

      {prompt && !isLoading && image && (
        <div className="text-xs text-text-light italic mb-3 bg-background p-3 rounded-lg">
          <span className="font-semibold text-primary">AI Prompt:</span> {prompt}
        </div>
      )}

      {isLoading && (
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-3 text-text-light">Creating your memorable image...</p>
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

          {/* Accept/Reject buttons */}
          <div className="flex justify-center space-x-4 mt-6">
            <button
              onClick={onReject}
              className="btn-loci-secondary"
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
  );
};

export default ImagePopup;
