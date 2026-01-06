import React, { useState, useEffect } from 'react';

const OptimizedImage = ({
  src,
  optimized,
  srcSet,
  alt,
  className = '',
  loading = 'lazy',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  fallbackSrc = '/images/placeholder.png',
  onLoad,
  onError,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Use the provided source directly (backend now returns optimized URLs)
    if (src) {
      setImageSrc(src);
    } else {
      // Use fallback
      setImageSrc(fallbackSrc);
    }
  }, [src, fallbackSrc]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setHasError(true);
    if (onError) onError();

    // Try fallback if not already using it
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {!isLoaded && !hasError && (
        <div
          className={`bg-gray-200 animate-pulse ${className}`}
          style={{ aspectRatio: '1/1', position: 'absolute', inset: 0, zIndex: 1 }}
        />
      )}
      <img
        src={imageSrc ? encodeURI(imageSrc) : fallbackSrc}
        alt={alt}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        style={{ position: 'relative', zIndex: 2 }}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;
