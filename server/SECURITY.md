# Security Implementation Guide

## Overview
This document outlines the comprehensive security measures implemented in the Memory Palace application, optimized for MVP development with easy progression to production-level security.

## Security Features Implemented

### 1. Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication with environment-appropriate expiration
  - **MVP**: 1 hour access tokens in development, 15 minutes in production
  - **Production**: 15-minute access tokens for short-lived sessions
- **Refresh Tokens**: Long-lived refresh tokens (7 days) stored as HTTP-only cookies
- **Token Blacklisting**: Invalidated tokens are blacklisted to prevent reuse
- **Role-based Access Control**: Support for different user roles and permissions
- **Resource Ownership**: Users can only access their own resources

### 2. Input Validation & Sanitization
- **Express Validator**: Comprehensive input validation for all endpoints
- **MVP-Friendly Password Requirements**: 6+ characters minimum (relaxed for development)
- **Production Password Requirements**: 8+ chars, uppercase, lowercase, number, special character
- **XSS Protection**: Automatic sanitization of user inputs
- **SQL Injection Prevention**: Parameterized queries and input sanitization
- **Content Type Validation**: Strict validation of file uploads and data types

### 3. Rate Limiting & DDoS Protection
- **General Rate Limiting**: 200 requests per 15 minutes per IP (MVP-friendly)
- **Authentication Rate Limiting**: 15 attempts per 15 minutes per IP (MVP-friendly)
- **Image Generation Rate Limiting**: 30 requests per hour per user (MVP-friendly)
- **Speed Limiting**: Gradual slowdown for excessive requests
- **IP-based Tracking**: Rate limits applied per IP address

**Production Rate Limits (when ready):**
- General: 100 requests per 15 minutes
- Authentication: 5 attempts per 15 minutes
- Image Generation: 10 requests per hour

### 4. Security Headers (Helmet.js)
- **Content Security Policy**: Restricts resource loading to trusted sources
  - **MVP**: Allows inline scripts for development
  - **Production**: Strict CSP with no inline scripts
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-XSS-Protection**: Additional XSS protection
- **Referrer Policy**: Controls referrer information
- **Permissions Policy**: Restricts browser features

### 5. CORS Configuration
- **Origin Validation**: Only allows requests from specified origins
- **Credentials Support**: Secure handling of cookies and authentication
- **Method Restrictions**: Limits HTTP methods to necessary ones
- **Header Validation**: Validates and restricts request headers

### 6. HTTP Parameter Pollution Protection
- **HPP Middleware**: Prevents HTTP parameter pollution attacks
- **Whitelist Approach**: Only allows specific parameters to be duplicated

### 7. Cookie Security
- **HTTP-Only Cookies**: Prevents XSS attacks on cookies
- **Secure Flag**: HTTPS-only cookies in production
- **SameSite Policy**: CSRF protection through strict same-site policy
- **Domain Restrictions**: Cookies restricted to specific domains

### 8. Error Handling
- **Information Disclosure Prevention**: No sensitive data in error messages
- **Structured Error Responses**: Consistent error format with codes
- **Logging**: Secure logging without sensitive information

### 9. Database Security
- **Connection Pooling**: Limits database connections
- **Query Timeouts**: Prevents long-running queries
- **Input Sanitization**: All database inputs are sanitized
- **NoSQL Injection Prevention**: Proper query construction

## Environment Variables Required

```bash
# Server Configuration
PORT=5000
NODE_ENV=development  # Automatically adjusts security settings

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/memory-palace

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-different-from-jwt-secret

# Security Configuration
FRONTEND_URL=http://localhost:3000
COOKIE_DOMAIN=localhost

# API Keys
OPENAI_API_KEY=your-openai-api-key
STABILITY_API_KEY=your-stability-api-key

# Rate Limiting (MVP-friendly defaults)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200  # MVP: 200, Production: 100
AUTH_RATE_LIMIT_MAX_REQUESTS=15  # MVP: 15, Production: 5
IMAGE_GEN_RATE_LIMIT_MAX_REQUESTS=30  # MVP: 30, Production: 10

# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Threat Boundaries

### What We Protect
- Authentication flows (signup, login, refresh, logout)
- User profile data and memory palace content
- Image generation requests and responses
- API availability and fair usage via rate limiting and slowdown

### What We Assume/Do Not Protect
- Client devices and browsers (compromised endpoints, malware)
- Networks between client and server prior to HTTPS termination
- Third‑party image model internals (Stability/OpenAI behavior beyond API contract)
- User‑installed browser extensions that can exfiltrate content

### Trust Zones
- Public internet → Edge/Load balancer (untrusted)
- Edge/Load balancer → Express app (trusted after TLS)
- Express app → MongoDB (trusted VPC/connection with auth)

### Key Boundaries and Controls
- Per‑IP and per‑route rate limits at Express middleware boundary
- JWT verification and CSRF protection at API boundary
- Strict input validation and sanitization at controller boundary
- Helmet/CSP at HTTP response boundary

### Abuse and DoS Considerations
- General, auth, and image generation rate limits mitigate brute force and abuse
- Speed limiting (progressive backoff) reduces resource exhaustion
- Log and monitor rate‑limit violations for IP blocks where necessary

## Security Best Practices

### 1. Password Requirements
- **MVP**: Minimum 6 characters
- **Production**: Minimum 8 characters with complexity requirements
- Stored using bcrypt with salt rounds

### 2. Token Management
- **MVP**: 1 hour access tokens in development
- **Production**: 15-minute access tokens
- Refresh tokens expire in 7 days
- Tokens are blacklisted on logout
- HTTP-only cookies for refresh tokens

### 3. API Security
- All endpoints require authentication (except public routes)
- Input validation on all endpoints
- Rate limiting on sensitive operations
- CORS properly configured

### 4. Data Protection
- No sensitive data in logs
- Encrypted data transmission (HTTPS in production)
- Secure session management
- Proper error handling

## Production Deployment Checklist

### 1. Environment Setup
- [ ] Set NODE_ENV=production (automatically enables strict security)
- [ ] Use strong, unique JWT secrets
- [ ] Configure HTTPS certificates
- [ ] Set up proper CORS origins
- [ ] Configure database with SSL

### 2. Security Headers
- [ ] Enable HSTS
- [ ] Configure CSP headers (automatically strict in production)
- [ ] Set secure cookie flags
- [ ] Enable HTTPS redirect

### 3. Monitoring
- [ ] Set up security logging
- [ ] Monitor rate limit violations
- [ ] Track authentication failures
- [ ] Monitor for suspicious activity

### 4. Database Security
- [ ] Use connection pooling
- [ ] Enable SSL connections
- [ ] Set up proper user permissions
- [ ] Regular security updates

## Security Testing

### 1. Authentication Tests
- Test token expiration
- Test refresh token rotation
- Test logout functionality
- Test rate limiting

### 2. Input Validation Tests
- Test XSS prevention
- Test SQL injection prevention
- Test file upload validation
- Test parameter pollution

### 3. Authorization Tests
- Test resource ownership
- Test role-based access
- Test unauthorized access attempts
- Test privilege escalation

### 4. Rate Limiting Tests
- Test general rate limits
- Test authentication rate limits
- Test image generation limits
- Test speed limiting

## MVP vs Production Security Settings

### Current MVP Settings (Development-Friendly)
```javascript
// Password Requirements
- Minimum length: 6 characters
- No complex character requirements

// Rate Limiting
- General: 200 requests per 15 minutes
- Authentication: 15 attempts per 15 minutes
- Image Generation: 30 requests per hour

// Token Expiration
- Access tokens: 1 hour (development)
- Refresh tokens: 7 days

// Input Validation
- Relaxed character restrictions
- Basic XSS protection
```

### Production Settings (Strict Security)
```javascript
// Password Requirements
- Minimum length: 8 characters
- Require uppercase, lowercase, number, special character

// Rate Limiting
- General: 100 requests per 15 minutes
- Authentication: 5 attempts per 15 minutes
- Image Generation: 10 requests per hour

// Token Expiration
- Access tokens: 15 minutes
- Refresh tokens: 7 days

// Input Validation
- Strict character validation
- Comprehensive XSS protection
```

## Automatic Security Progression

The application automatically adjusts security settings based on `NODE_ENV`:

- **Development (`NODE_ENV=development`)**: MVP-friendly settings
- **Production (`NODE_ENV=production`)**: Strict security settings

This allows for seamless progression from MVP to production without code changes.

## Incident Response

### 1. Security Breach Response
1. Immediately revoke all tokens
2. Investigate the breach
3. Update security measures
4. Notify affected users
5. Document the incident

### 2. Rate Limit Violations
1. Monitor for patterns
2. Adjust limits if necessary
3. Block malicious IPs
4. Log violations for analysis

### 3. Authentication Failures
1. Monitor for brute force attempts
2. Implement account lockout
3. Require additional verification
4. Log suspicious activity

## Regular Security Maintenance

### 1. Updates
- Keep dependencies updated
- Monitor security advisories
- Update security configurations
- Test security measures

### 2. Monitoring
- Review security logs
- Monitor for anomalies
- Track security metrics
- Update security policies

### 3. Testing
- Regular security audits
- Penetration testing
- Vulnerability assessments
- Code security reviews

## Quick Security Checklist

### For MVP Development:
- [x] Basic authentication working
- [x] Rate limiting not blocking normal usage
- [x] Password requirements reasonable
- [x] Input validation not too restrictive
- [x] Token expiration reasonable for testing

### For Production:
- [x] Environment automatically enables strict security
- [x] Increase password requirements (automatic)
- [x] Tighten rate limiting (automatic)
- [x] Shorten token expiration (automatic)
- [x] Enable strict CSP (automatic)
- [ ] Add comprehensive monitoring
- [ ] Security audit completed
