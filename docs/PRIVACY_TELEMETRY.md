# Privacy and Telemetry Documentation

## Overview

This document outlines the privacy practices and telemetry collection in the Low·sAI Memory Palace application.

## Data Collection Status

### ✅ **Currently Disabled**
- **No external analytics** are active
- **No telemetry** is sent to third parties
- **No user tracking** beyond essential authentication
- **No data harvesting** or profiling

### 📊 **Analytics System (Local Only)**

The application includes a local analytics system that is **disabled by default**:

```javascript
// Location: client/src/utils/analytics.js
class Analytics {
  constructor() {
    this.isEnabled = false; // DISABLED BY DEFAULT
    this.events = [];
  }
}
```

**What it does when enabled:**
- Tracks page views locally
- Records user interactions locally
- Stores performance metrics locally
- **Does NOT send data externally**

**How to enable (for development only):**
```javascript
// Only for local development/testing
analytics.enable();
```

### 🔧 **Performance Monitoring (Local Only)**

The application includes performance monitoring that is **local-only**:

```javascript
// Location: client/src/utils/performance.js
// Tracks: Image load times, API response times, errors
// Storage: Local browser storage only
// External: None
```

## Data Storage

### **Local Storage Only**
- Analytics data: Stored in browser memory (cleared on page refresh)
- Performance metrics: Stored in browser memory
- User data: Stored in MongoDB (your database)
- **No external services** receive any data

### **What We Don't Collect**
- ❌ IP addresses (beyond server logs)
- ❌ Browser fingerprints
- ❌ Cross-site tracking
- ❌ Personal information beyond email
- ❌ Usage patterns for advertising
- ❌ Location data
- ❌ Device information

## Third-Party Services

### **Stability AI (Image Generation)**
- **Purpose:** Generate AI images for memory palaces
- **Data sent:** Image generation prompts only
- **Data received:** Generated images
- **Retention:** Images stored locally, not sent to us

### **MongoDB Atlas (Database)**
- **Purpose:** Store user accounts and memory palaces
- **Data stored:** Email, hashed passwords, memory palace data
- **Location:** Your MongoDB Atlas cluster
- **Access:** Only you have access

### **Render (Hosting)**
- **Purpose:** Host the application
- **Data:** Standard server logs (IP addresses, request logs)
- **Retention:** Standard hosting logs (typically 30-90 days)

## Privacy Controls

### **User Control**
- Users can delete their accounts (removes all data)
- Users can clear their memory palaces
- No persistent tracking across sessions
- No cross-device tracking

### **Developer Control**
- Analytics can be completely disabled
- Performance monitoring can be disabled
- No external telemetry is hardcoded

## Compliance

### **GDPR Compliance**
- ✅ No personal data sent to third parties
- ✅ Users can delete their data
- ✅ No tracking without consent
- ✅ Data minimization principles followed

### **CCPA Compliance**
- ✅ No sale of personal information
- ✅ Users can request data deletion
- ✅ No tracking for commercial purposes

## Monitoring Dashboard

The application includes a **local-only** monitoring dashboard:

```javascript
// Location: client/src/components/MonitoringDashboard.js
// Purpose: Development/debugging tool
// Data: Local analytics and performance metrics only
// External: No data sent anywhere
```

**Access:** Only available in development mode
**Data:** Shows local analytics and performance data
**Export:** Downloads local data as JSON file

## Web Vitals

The application includes web vitals reporting that is **disabled by default**:

```javascript
// Location: client/src/reportWebVitals.js
// Purpose: Performance monitoring
// Default: No function passed (disabled)
// External: None
```

## Security

### **Data Protection**
- All passwords are hashed with bcrypt
- JWT tokens for authentication
- CSRF protection enabled
- No sensitive data in logs

### **Network Security**
- HTTPS enforced in production
- Secure headers implemented
- No mixed content allowed

## Future Considerations

If external analytics are added in the future:

1. **Explicit opt-in** will be required
2. **Clear disclosure** in privacy policy
3. **User control** over data collection
4. **GDPR/CCPA compliance** maintained
5. **Minimal data collection** principles

## Contact

For privacy questions or data deletion requests:
- **Email:** [Your contact email]
- **GitHub Issues:** [Repository issues page]

---

**Last Updated:** January 2025
**Version:** 1.0
