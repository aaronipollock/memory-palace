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
    // Determine the best image source based on optimization data
    if (optimized && srcSet) {
      // Use optimized WebP with srcset
      setImageSrc(srcSet.defaultSrc);
    } else if (src) {
      // Fallback to original source
      setImageSrc(src);
    } else {
      // Use fallback
      setImageSrc(fallbackSrc);
    }
  }, [src, optimized, srcSet, fallbackSrc]);

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

  // Show loading skeleton while image loads
  if (!isLoaded && !hasError) {
    return (
      <div
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{ aspectRatio: '1/1' }}
        {...props}
      />
    );
  }

  return (
    <picture>
      {/* WebP source with srcset for modern browsers */}
      {optimized && srcSet && (
        <source
          type="image/webp"
          srcSet={srcSet.srcset}
          sizes={sizes}
        />
      )}

      {/* Fallback image */}
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </picture>
  );
};

export default OptimizedImage;
