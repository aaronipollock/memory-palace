import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const spinnerStyle = {
    animation: 'spin 1s linear infinite',
    border: '4px solid #1B365D',
    borderTop: '4px solid #7C3AED',
    borderRadius: '50%',
    width: size === 'sm' ? '16px' : size === 'md' ? '32px' : size === 'lg' ? '48px' : '64px',
    height: size === 'sm' ? '16px' : size === 'md' ? '32px' : size === 'lg' ? '48px' : '64px',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div style={spinnerStyle}></div>
      {text && (
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
