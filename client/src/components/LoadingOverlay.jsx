import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const LoadingOverlay = ({ isVisible, text = 'Loading...', children }) => {
  if (!isVisible) return children;

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
};

export default LoadingOverlay;
