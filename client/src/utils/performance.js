// Performance monitoring utilities
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      imageLoadTimes: [],
      apiResponseTimes: [],
      pageLoadTimes: [],
      errors: []
    };
  }

  // Track image loading performance
  trackImageLoad(imageUrl, startTime) {
    const loadTime = performance.now() - startTime;
    this.metrics.imageLoadTimes.push({
      url: imageUrl,
      loadTime,
      timestamp: Date.now()
    });

    // Log slow images
    if (loadTime > 3000) {
      console.warn(`Slow image load: ${imageUrl} took ${loadTime.toFixed(2)}ms`);
    }

    return loadTime;
  }

  // Track API response times
  trackApiCall(endpoint, startTime) {
    const responseTime = performance.now() - startTime;
    this.metrics.apiResponseTimes.push({
      endpoint,
      responseTime,
      timestamp: Date.now()
    });

    return responseTime;
  }

  // Track page load times
  trackPageLoad(pageName, startTime) {
    const loadTime = performance.now() - startTime;
    this.metrics.pageLoadTimes.push({
      page: pageName,
      loadTime,
      timestamp: Date.now()
    });

    return loadTime;
  }

  // Track errors
  trackError(error, context) {
    this.metrics.errors.push({
      error: error.message,
      context,
      timestamp: Date.now(),
      stack: error.stack
    });
  }

  // Get performance summary
  getSummary() {
    const avgImageLoad = this.metrics.imageLoadTimes.length > 0
      ? this.metrics.imageLoadTimes.reduce((sum, m) => sum + m.loadTime, 0) / this.metrics.imageLoadTimes.length
      : 0;

    const avgApiResponse = this.metrics.apiResponseTimes.length > 0
      ? this.metrics.apiResponseTimes.reduce((sum, m) => sum + m.responseTime, 0) / this.metrics.apiResponseTimes.length
      : 0;

    return {
      avgImageLoadTime: avgImageLoad.toFixed(2),
      avgApiResponseTime: avgApiResponse.toFixed(2),
      totalImages: this.metrics.imageLoadTimes.length,
      totalApiCalls: this.metrics.apiResponseTimes.length,
      totalErrors: this.metrics.errors.length
    };
  }

  // Clear old metrics (keep last 100 entries)
  cleanup() {
    const maxEntries = 100;

    Object.keys(this.metrics).forEach(key => {
      if (this.metrics[key].length > maxEntries) {
        this.metrics[key] = this.metrics[key].slice(-maxEntries);
      }
    });
  }

  // Export metrics for analysis
  exportMetrics() {
    return JSON.stringify(this.metrics, null, 2);
  }
}

// Global performance monitor instance
const performanceMonitor = new PerformanceMonitor();

// Image loading performance wrapper
export const trackImageLoad = (imageUrl) => {
  const startTime = performance.now();

  return {
    onLoad: () => performanceMonitor.trackImageLoad(imageUrl, startTime),
    onError: (error) => performanceMonitor.trackError(error, 'image-load')
  };
};

// API call performance wrapper
export const trackApiCall = (endpoint) => {
  const startTime = performance.now();

  return {
    onComplete: () => performanceMonitor.trackApiCall(endpoint, startTime),
    onError: (error) => performanceMonitor.trackError(error, 'api-call')
  };
};

// Page load performance wrapper
export const trackPageLoad = (pageName) => {
  const startTime = performance.now();

  return {
    onComplete: () => performanceMonitor.trackPageLoad(pageName, startTime)
  };
};

// Export the monitor for debugging
export { performanceMonitor };
