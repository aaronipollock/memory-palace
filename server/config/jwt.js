const jwt = require('jsonwebtoken');

// JWT secret key - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
// In production, this should be a separate secret. In dev, fall back to JWT_SECRET for convenience.
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// In-memory token blacklist (use Redis in production)
const tokenBlacklist = new Set();

// Generate access token
const generateAccessToken = (userId, email) => {
    return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Generate refresh token
const generateRefreshToken = (userId) => {
    return jwt.sign({ userId, type: 'refresh' }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
};

// Verify access token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid token');
    }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
        if (decoded?.type !== 'refresh') {
            throw new Error('Invalid refresh token');
        }
        return decoded;
    } catch (error) {
        throw new Error('Invalid refresh token');
    }
};

// Blacklist a token
const blacklistToken = (token) => {
    tokenBlacklist.add(token);
};

// Check if token is blacklisted
const isTokenBlacklisted = (token) => {
    return tokenBlacklist.has(token);
};

// Decode token without verification (for debugging)
const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    } catch (error) {
        return null;
    }
};

// Refresh token
const refreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET, { ignoreExpiration: true });
        if (decoded?.type !== 'refresh') {
            throw new Error('Invalid refresh token');
        }
        delete decoded.exp;
        delete decoded.iat;
        return generateAccessToken(decoded.userId, decoded.email);
    } catch (error) {
        throw new Error('Invalid token for refresh');
    }
};

// JWT configuration for cookies
const jwtConfig = {
    refreshCookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost'
    }
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    verifyRefreshToken,
    blacklistToken,
    isTokenBlacklisted,
    decodeToken,
    refreshToken,
    jwtConfig,
    JWT_SECRET,
    JWT_REFRESH_SECRET,
    JWT_EXPIRES_IN
};
