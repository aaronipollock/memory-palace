# MVP-Friendly Security Configuration

## Overview
This guide explains the security configuration optimized for MVP development while maintaining essential security protections.

## MVP-Friendly Security Settings

### 1. **Password Requirements (Relaxed)**
```javascript
// MVP Settings:
- Minimum length: 6 characters (instead of 8)
- No complex character requirements
- No special character requirements

// Production Settings (when ready):
- Minimum length: 8 characters
- Require uppercase, lowercase, number, special character
```

### 2. **Rate Limiting (More Generous)**
```javascript
// MVP Settings:
- General: 200 requests per 15 minutes (was 100)
- Authentication: 15 attempts per 15 minutes (was 5)
- Image Generation: 30 requests per hour (was 10)
- Speed Limiting: 100 requests before slowdown (was 50)

// Production Settings (when ready):
- General: 100 requests per 15 minutes
- Authentication: 5 attempts per 15 minutes
- Image Generation: 10 requests per hour
```

### 3. **Token Expiration (Longer for Development)**
```javascript
// MVP Settings:
- Access tokens: 1 hour in development, 15 minutes in production
- Refresh tokens: 7 days (unchanged)

// Production Settings:
- Access tokens: 15 minutes
- Refresh tokens: 7 days
```

### 4. **Input Validation (More Permissive)**
```javascript
// MVP Settings:
- Removed strict character restrictions
- Allow most common characters
- Basic XSS protection only

// Production Settings:
- Strict character validation
- Comprehensive XSS protection
- Input sanitization
```

### 5. **Content Security Policy (Relaxed)**
```javascript
// MVP Settings:
- Allow inline scripts for development
- More permissive resource loading

// Production Settings:
- Strict CSP with no inline scripts
- Restricted resource loading
```

## How to Switch to Production Security

### 1. **Environment-Based Configuration**
The security settings automatically adjust based on `NODE_ENV`:

```bash
# Development (MVP-friendly)
NODE_ENV=development

# Production (Strict security)
NODE_ENV=production
```

### 2. **Manual Override Options**
You can override specific settings by modifying these files:

#### Rate Limiting Override
```javascript
// In server/config/security.js
const securityConfig = {
  // Adjust these values as needed
  generalLimiter: createRateLimit(15 * 60 * 1000, 100, '...'),
  authLimiter: createRateLimit(15 * 60 * 1000, 5, '...'),
  imageGenLimiter: createRateLimit(60 * 60 * 1000, 10, '...'),
};
```

#### Password Requirements Override
```javascript
// In server/middleware/validation.js
body('password')
  .isLength({ min: 8 }) // Change from 6 to 8
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .withMessage('Password must contain uppercase, lowercase, number, and special character'),
```

#### Token Expiration Override
```javascript
// In server/config/jwt.js
const jwtConfig = {
  accessTokenExpiry: '15m', // Force 15 minutes even in development
  // ... rest of config
};
```

## Security Features Still Active

Even with MVP-friendly settings, these security features remain active:

### ✅ **Core Security (Always On)**
- JWT authentication with refresh tokens
- Token blacklisting on logout
- CORS protection
- Basic XSS protection
- Input sanitization
- Security headers (Helmet.js)
- HTTP Parameter Pollution protection
- Rate limiting (just more generous)
- Error handling without data leakage

### ✅ **Database Security**
- Connection pooling
- Query timeouts
- Input sanitization
- NoSQL injection prevention

### ✅ **Frontend Security**
- Secure API client
- Token management
- Input sanitization
- Password validation (relaxed but present)

## Recommended Security Progression

### Phase 1: MVP Development (Current)
- Use current MVP-friendly settings
- Focus on functionality and user experience
- Basic security protection

### Phase 2: Beta Testing
- Gradually increase rate limits
- Add more password requirements
- Tighten input validation

### Phase 3: Production Launch
- Enable all strict security settings
- Implement comprehensive monitoring
- Regular security audits

## Quick Security Checklist

### For MVP Development:
- [x] Basic authentication working
- [x] Rate limiting not blocking normal usage
- [x] Password requirements reasonable
- [x] Input validation not too restrictive
- [x] Token expiration reasonable for testing

### For Production:
- [ ] Increase password requirements
- [ ] Tighten rate limiting
- [ ] Shorten token expiration
- [ ] Enable strict CSP
- [ ] Add comprehensive monitoring
- [ ] Security audit completed

## Environment Variables for Different Security Levels

### Development (.env.development)
```bash
NODE_ENV=development
RATE_LIMIT_MAX_REQUESTS=200
AUTH_RATE_LIMIT_MAX_REQUESTS=15
IMAGE_GEN_RATE_LIMIT_MAX_REQUESTS=30
PASSWORD_MIN_LENGTH=6
```

### Production (.env.production)
```bash
NODE_ENV=production
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=5
IMAGE_GEN_RATE_LIMIT_MAX_REQUESTS=10
PASSWORD_MIN_LENGTH=8
```

## Conclusion

The current MVP-friendly security configuration provides:
- **Essential security protection** against common attacks
- **Reasonable restrictions** that don't hinder development
- **Easy progression** to production-level security
- **Environment-based** automatic adjustment

This approach allows you to focus on building features while maintaining a solid security foundation that can be strengthened as your application grows.
