const jwt = require('jsonwebtoken');

// JWT configuration
const jwtConfig = {
  // Token expiration times (more generous for MVP)
  accessTokenExpiry: process.env.NODE_ENV === 'production' ? '15m' : '1h', // 1 hour for development
  refreshTokenExpiry: '7d', // 7 days for refresh tokens

  // Cookie settings for production
  cookieOptions: {
    httpOnly: true, // Prevents XSS attacks
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined
  },

  // Refresh token cookie settings
  refreshCookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth/refresh',
    domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined
  }
};

// Generate access token
const generateAccessToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET,
    { expiresIn: jwtConfig.accessTokenExpiry }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: jwtConfig.refreshTokenExpiry }
  );
};

// Verify token
const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

// Token blacklist (for logout functionality)
const tokenBlacklist = new Set();

// Add token to blacklist
const blacklistToken = (token) => {
  tokenBlacklist.add(token);
  // Clean up old tokens after 24 hours
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, 24 * 60 * 60 * 1000);
};

// Check if token is blacklisted
const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

module.exports = {
  jwtConfig,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  blacklistToken,
  isTokenBlacklisted
};
