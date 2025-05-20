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
      className="fixed bg-white rounded-lg shadow-xl p-4 z-50 pipe"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: position.transform || 'translate(-50%, -120%)',
        maxWidth: '400px',
        backgroundColor: '#fff',
        border: '4px solid #5b8200'
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-white bg-primary hover:bg-red-700 w-8 h-8 flex items-center justify-center rounded-full"
      >
        ×
      </button>

      <h3 className="mario-header text-lg mb-2 text-primary">
        {association.anchor}: {association.memorable}
      </h3>

      {association.description && (
        <div className="text-sm text-gray-700 mb-3 bg-gray-50 p-2 rounded border border-gray-200">
          <span className="font-semibold">Memory Aid:</span> {association.description}
        </div>
      )}

      {prompt && !isLoading && image && (
        <div className="text-xs text-gray-600 italic mb-2 bg-gray-100 p-2 rounded">
          <span className="font-semibold">AI Prompt:</span> {prompt}
        </div>
      )}

      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-secondary">Creating your memorable image...</p>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center py-2 bg-white rounded p-1">
          {error}
        </div>
      )}

      {image && (
        <div className="mt-3">
          <img
            src={image}
            alt={`${association.memorable} with ${association.anchor}`}
            className="rounded-lg shadow-md max-w-full h-auto coin"
            onError={(e) => {
              console.error('Image failed to load:', e);
            }}
          />

          {/* Accept/Reject buttons */}
          <div className="flex justify-center space-x-4 mt-4">
            <button
              onClick={onReject}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
            >
              Reject
            </button>
            <button
              onClick={onAccept}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200"
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
