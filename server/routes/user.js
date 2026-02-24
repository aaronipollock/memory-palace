const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { userValidation, sanitizeInput, xssProtection } = require('../middleware/validation');
const asyncHandler = require('../utils/asyncHandler');

router.use(authenticateToken);

// Profile management
router.get('/profile', asyncHandler(userController.getProfile));
router.put('/profile', sanitizeInput, xssProtection, userValidation.updateProfile, asyncHandler(userController.updateProfile));
router.put('/password', sanitizeInput, xssProtection, userValidation.changePassword, asyncHandler(userController.changePassword));
router.get('/stats', asyncHandler(userController.getStats));
router.delete('/account', sanitizeInput, xssProtection, userValidation.deleteAccount, asyncHandler(userController.deleteAccount));

module.exports = router;
