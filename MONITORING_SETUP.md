# Monitoring & Analytics Setup Guide

## Overview
This guide covers setting up comprehensive monitoring for the Memory Palace application, from MVP to production.

## Current Status ✅

### **Already Implemented:**
- ✅ **Basic Performance Monitoring**: Custom performance tracker with Web Vitals
- ✅ **Error Handling**: Centralized error handling with structured responses
- ✅ **Analytics Framework**: Extensible analytics utility
- ✅ **Logging Framework**: Server-side logging with levels and context
- ✅ **Monitoring Dashboard**: Development debugging interface

## MVP Monitoring Setup (Current)

### **1. Frontend Analytics**
```javascript
// Track page views
import { trackPageView } from '../utils/analytics';
trackPageView('home', { source: 'landing' });

// Track user actions
import { trackEvent } from '../utils/analytics';
trackEvent('image_generated', { roomType: 'throne', style: 'realistic' });

// Track errors
import { trackError } from '../utils/analytics';
trackError(error, { context: 'image_generation' });
```

### **2. Performance Monitoring**
```javascript
// Track API calls
import { trackApiCall } from '../utils/performance';
const tracker = trackApiCall('/api/generate-room');
try {
  const response = await apiCall();
  tracker.onComplete();
} catch (error) {
  tracker.onError(error);
}

// Track image loading
import { trackImageLoad } from '../utils/performance';
const tracker = trackImageLoad(imageUrl);
img.onload = tracker.onLoad;
img.onerror = tracker.onError;
```

### **3. Server Logging**
```javascript
// Import logger
import { logInfo, logError, logSecurity } from '../utils/logger';

// Log different types
logInfo('User logged in', { userId: user.id });
logError('Database connection failed', { error: err.message });
logSecurity('Rate limit exceeded', { ip: req.ip });
```

## Production Monitoring Setup

### **Option 1: Google Analytics 4 (Free)**

#### **Frontend Setup:**
```bash
# Install GA4
npm install gtag
```

```javascript
// In index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

```javascript
// Update analytics.js
sendToExternalService(event) {
  if (window.gtag) {
    gtag('event', event.event, {
      event_category: 'user_action',
      event_label: event.properties?.page || 'unknown',
      value: event.properties?.value,
      custom_parameters: event.properties
    });
  }
}
```

### **Option 2: Sentry Error Tracking (Free Tier)**

#### **Installation:**
```bash
# Frontend
npm install @sentry/react @sentry/tracing

# Backend
npm install @sentry/node
```

#### **Frontend Setup:**
```javascript
// In index.js
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

#### **Backend Setup:**
```javascript
// In server.js
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Update logger.js
sendToExternalService(logEntry) {
  if (logEntry.level === 'ERROR') {
    Sentry.captureException(new Error(logEntry.message), {
      extra: logEntry.data
    });
  }
}
```

### **Option 3: Winston Logging (Backend)**

#### **Installation:**
```bash
npm install winston winston-daily-rotate-file
```

#### **Setup:**
```javascript
// Update server/utils/logger.js
const winston = require('winston');
require('winston-daily-rotate-file');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d'
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

## Advanced Monitoring Options

### **Option 4: New Relic APM (Paid)**
- Application Performance Monitoring
- Real-time error tracking
- Database query monitoring
- Custom dashboards

### **Option 5: DataDog (Paid)**
- Full-stack monitoring
- Infrastructure monitoring
- Log aggregation
- Custom metrics

### **Option 6: LogRocket (Paid)**
- Session replay
- Error tracking
- Performance monitoring
- User behavior analytics

## Environment Variables

### **Development (.env.development)**
```bash
# Monitoring
LOG_LEVEL=debug
ENABLE_ANALYTICS=false
ENABLE_ERROR_TRACKING=false
```

### **Production (.env.production)**
```bash
# Monitoring
LOG_LEVEL=info
ENABLE_ANALYTICS=true
ENABLE_ERROR_TRACKING=true

# Google Analytics
GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Sentry
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# Logging
LOG_FILE_PATH=/var/log/memory-palace
LOG_RETENTION_DAYS=30
```

## Monitoring Dashboard Access

### **Development Mode:**
- Press `Ctrl+Shift+M` (or `Cmd+Shift+M` on Mac) to open monitoring dashboard
- View real-time analytics and performance data
- Export data for analysis
- Clear data for testing

### **Production Mode:**
- Access via `/admin/monitoring` (with authentication)
- Real-time metrics and error tracking
- Performance analytics
- User behavior insights

## Key Metrics to Track

### **User Engagement:**
- Page views per session
- Time spent on each page
- Feature usage (image generation, saving)
- User retention

### **Performance:**
- Page load times
- API response times
- Image generation times
- Error rates

### **Business Metrics:**
- User signups
- Memory palaces created
- Images generated
- User satisfaction

### **Technical Metrics:**
- Server response times
- Database query performance
- Memory usage
- Error frequency

## Alerting Setup

### **Critical Alerts:**
- Server down
- High error rate (>5%)
- Database connection issues
- API rate limit exceeded

### **Performance Alerts:**
- Response time > 2 seconds
- Image generation > 30 seconds
- Memory usage > 80%

### **Business Alerts:**
- User signup rate drop
- Feature usage decline
- Payment failures

## Implementation Checklist

### **MVP (Current):**
- [x] Basic analytics framework
- [x] Performance monitoring
- [x] Error handling
- [x] Development dashboard
- [x] Server logging

### **Production Ready:**
- [ ] Google Analytics 4 integration
- [ ] Sentry error tracking
- [ ] Winston logging
- [ ] Production dashboard
- [ ] Alerting setup
- [ ] Log retention policy
- [ ] Performance baselines
- [ ] Error rate monitoring

### **Advanced (Future):**
- [ ] Real User Monitoring (RUM)
- [ ] A/B testing framework
- [ ] User journey analytics
- [ ] Predictive analytics
- [ ] Custom dashboards
- [ ] Automated reporting

## Quick Start Commands

```bash
# Install monitoring dependencies
npm install @sentry/react @sentry/node winston winston-daily-rotate-file gtag

# Set up environment variables
cp .env.example .env.production
# Edit .env.production with your monitoring keys

# Start with monitoring enabled
NODE_ENV=production npm start

# View logs
tail -f logs/combined-$(date +%Y-%m-%d).log

# Export monitoring data
curl http://localhost:5001/api/admin/monitoring/export
```

## Conclusion

The current MVP monitoring setup provides:
- ✅ **Basic tracking** for development and testing
- ✅ **Extensible framework** for production services
- ✅ **Performance insights** for optimization
- ✅ **Error tracking** for debugging
- ✅ **User analytics** for growth

Ready to scale to production monitoring with external services!
