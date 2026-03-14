const crypto = require('crypto');

const MAX_LENGTH = 128;
const VALID_PATTERN = /^[a-zA-Z0-9_-]+$/;

/**
 * Generate a lightweight request ID for log correlation
 * Uses a short random string (8 chars) for readability
 */
const generateRequestId = () => {
    return crypto.randomBytes(4).toString('hex');
};

/**
 * Returns true if the incoming value is safe to use as a request ID (length, charset).
 * Invalid values are ignored and a fresh ID is generated instead.
 */
const isValidRequestId = (value) => {
    if (typeof value !== 'string' || value.length === 0 || value.length > MAX_LENGTH) {
        return false;
    }
    return VALID_PATTERN.test(value);
};

/**
 * Middleware to generate and attach request ID to each request.
 * Uses X-Request-ID if present and valid; otherwise generates a fresh one.
 * Sets req.id, res.locals.requestId, and the X-Request-ID response header.
 */
const requestIdMiddleware = (req, res, next) => {
    const incoming = req.headers['x-request-id'];
    req.id = isValidRequestId(incoming) ? incoming : generateRequestId();
    res.locals.requestId = req.id;
    res.setHeader('X-Request-ID', req.id);

    next();
};

module.exports = requestIdMiddleware;
