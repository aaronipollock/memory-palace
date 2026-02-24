const crypto = require('crypto');

/**
 * Generate a lightweight request ID for log correlation
 * Uses a short random string (8 chars) for readability
 */
const generateRequestId = () => {
    return crypto.randomBytes(4).toString('hex');
};

/**
 * Middleware to generate and attach request ID to each request
 * The ID is available as req.id throughout the request lifecycle
 */
const requestIdMiddleware = (req, res, next) => {
    // Generate or use existing X-Request-ID header (for distributed tracing)
    req.id = req.headers['x-request-id'] || generateRequestId();

    // Add request ID to response header for client correlation
    res.setHeader('X-Request-ID', req.id);

    next();
};

module.exports = requestIdMiddleware;
