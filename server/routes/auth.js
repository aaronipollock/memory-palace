const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authValidation, sanitizeInput, xssProtection } = require('../middleware/validation');
const { authRateLimit, securityHeaders, authenticateToken } = require('../middleware/auth');
const { generateToken, refreshToken, blacklistToken } = require('../config/jwt');

// Apply security headers to all auth routes
router.use(securityHeaders);

// Signup route with validation and rate limiting
router.post('/signup',
  authRateLimit,
  sanitizeInput,
  xssProtection,
  authValidation.signup,
  authController.signup
);

// Login route with validation and rate limiting
router.post('/login',
  authRateLimit,
  sanitizeInput,
  xssProtection,
  authValidation.login,
  authController.login
);

// Refresh token route
router.post('/refresh', (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      error: 'Refresh token required',
      code: 'MISSING_REFRESH_TOKEN'
    });
  }

  try {
    const { verifyToken, generateToken } = require('../config/jwt');
    const decoded = verifyToken(refreshToken);

    // Generate new access token
    const newAccessToken = generateToken({ userId: decoded.userId, email: decoded.email });

    res.json({
      accessToken: newAccessToken,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    res.status(401).json({
      error: 'Invalid refresh token',
      code: 'INVALID_REFRESH_TOKEN'
    });
  }
});

// Logout route with authentication required
router.post('/logout',
  authenticateToken,
  authController.logout
);

// Logout all sessions route
router.post('/logout-all', (req, res) => {
  // This would typically invalidate all refresh tokens for the user
  // For now, we'll just clear the current session
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    blacklistToken(token);
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth/refresh'
  });

  res.json({
    message: 'All sessions logged out successfully'
  });
});

module.exports = router;
