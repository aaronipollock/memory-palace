// Simple analytics utility for MVP
// Can be easily extended with Google Analytics, Mixpanel, etc.

class Analytics {
  constructor() {
    this.events = [];
    this.userId = null;
    this.sessionId = this.generateSessionId();
    this.isEnabled = false; // DISABLED BY DEFAULT - No external telemetry
  }

  // Generate unique session ID
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Set user ID for tracking
  setUserId(userId) {
    this.userId = userId;
  }

  // Track page views
  trackPageView(pageName, properties = {}) {
    this.track('page_view', {
      page: pageName,
      ...properties
    });
  }

  // Track user actions
  trackEvent(eventName, properties = {}) {
    this.track(eventName, properties);
  }

  // Track errors
  trackError(error, context = {}) {
    this.track('error', {
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
  }

  // Track performance metrics
  trackPerformance(metricName, value, properties = {}) {
    this.track('performance', {
      metric: metricName,
      value,
      ...properties
    });
  }

  // Track user engagement
  trackEngagement(action, properties = {}) {
    this.track('engagement', {
      action,
      ...properties
    });
  }

  // Core tracking method
  track(eventName, properties = {}) {
    const event = {
      event: eventName,
      properties,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.events.push(event);

    // Log in development
    if (!this.isEnabled) {
      console.log('📊 Analytics Event:', event);
    }

    // Send to external service in production
    if (this.isEnabled) {
      this.sendToExternalService(event);
    }

    // Keep only last 100 events in memory
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }
  }

  // Send to external analytics service (placeholder)
  sendToExternalService(event) {
    // External analytics service integration can be added here
    // NOTE: This is currently disabled for privacy compliance
    // To enable external analytics, explicit user consent is required

    // For now, just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event (Local Only):', event);
    }
  }

  // Get analytics data for debugging
  getAnalyticsData() {
    return {
      events: this.events,
      userId: this.userId,
      sessionId: this.sessionId,
      totalEvents: this.events.length
    };
  }

  // Export analytics data
  exportAnalytics() {
    return JSON.stringify(this.getAnalyticsData(), null, 2);
  }

  // Clear analytics data
  clearAnalytics() {
    this.events = [];
  }
}

// Global analytics instance
const analytics = new Analytics();

// Convenience functions
export const trackPageView = (pageName, properties) => analytics.trackPageView(pageName, properties);
export const trackEvent = (eventName, properties) => analytics.trackEvent(eventName, properties);
export const trackError = (error, context) => analytics.trackError(error, context);
export const trackPerformance = (metricName, value, properties) => analytics.trackPerformance(metricName, value, properties);
export const trackEngagement = (action, properties) => analytics.trackEngagement(action, properties);
export const setUserId = (userId) => analytics.setUserId(userId);

// Export the analytics instance
export { analytics };
