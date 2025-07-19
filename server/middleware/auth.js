const { verifyToken, isTokenBlacklisted } = require('../config/jwt');
const User = require('../models/User');

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            error: 'Access token required',
            code: 'MISSING_TOKEN'
        });
    }

    try {
        // Check if token is blacklisted
        if (isTokenBlacklisted(token)) {
            return res.status(401).json({
                error: 'Token has been invalidated',
                code: 'TOKEN_BLACKLISTED'
            });
        }

        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            error: 'Invalid or expired token',
            code: 'INVALID_TOKEN'
        });
    }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            if (!isTokenBlacklisted(token)) {
                const decoded = verifyToken(token);
                req.user = decoded;
            }
        } catch (error) {
            // Token is invalid, but we don't fail the request
            console.log('Optional auth failed:', error.message);
        }
    }

    next();
};

// Role-based authorization middleware
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Insufficient permissions',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }

        next();
    };
};

// Resource ownership middleware
const requireOwnership = (resourceModel) => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params.id;
            const resource = await resourceModel.findById(resourceId);

            if (!resource) {
                return res.status(404).json({
                    error: 'Resource not found',
                    code: 'RESOURCE_NOT_FOUND'
                });
            }

            // Check if user owns the resource or is admin
            if (resource.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
                return res.status(403).json({
                    error: 'Access denied',
                    code: 'ACCESS_DENIED'
                });
            }

            req.resource = resource;
            next();
        } catch (error) {
            return res.status(500).json({
                error: 'Server error',
                code: 'SERVER_ERROR'
            });
        }
    };
};

// Rate limiting for authentication attempts
const authRateLimit = (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const key = `auth_attempts_${clientIP}`;

    // This would typically use Redis or a similar store
    // For now, we'll use a simple in-memory store
    if (!global.authAttempts) {
        global.authAttempts = new Map();
    }

    const attempts = global.authAttempts.get(key) || 0;

    if (attempts >= 5) {
        return res.status(429).json({
            error: 'Too many authentication attempts',
            code: 'AUTH_RATE_LIMIT',
            retryAfter: 900 // 15 minutes
        });
    }

    global.authAttempts.set(key, attempts + 1);

    // Reset after 15 minutes
    setTimeout(() => {
        global.authAttempts.delete(key);
    }, 15 * 60 * 1000);

    next();
};

// CSRF protection middleware
const csrfProtection = (req, res, next) => {
  // Skip CSRF check for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

  // Ensure req.cookies exists
  const cookies = req.cookies || {};
  const csrfCookie = cookies['csrfToken'];
  const csrfHeader = req.headers['x-csrf-token'];

  console.log('CSRF Debug:', {
    method: req.method,
    path: req.path,
    csrfCookie: csrfCookie,
    csrfHeader: csrfHeader,
    cookies: Object.keys(cookies),
    headers: Object.keys(req.headers).filter(h => h.toLowerCase().includes('csrf'))
  });

  // Both must be present and match exactly
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
        console.log('CSRF validation failed:', {
          hasCookie: !!csrfCookie,
          hasHeader: !!csrfHeader,
          cookieMatchesHeader: csrfCookie === csrfHeader
        });
        return res.status(403).json({
            error: 'CSRF token validation failed',
            code: 'CSRF_ERROR'
        });
    }

    console.log('CSRF validation passed');
    next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.openai.com https://api.stability.ai;");

    next();
};

module.exports = {
    authenticateToken,
    optionalAuth,
    requireRole,
    requireOwnership,
    authRateLimit,
    csrfProtection,
    securityHeaders
};
