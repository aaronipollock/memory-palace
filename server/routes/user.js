const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { userValidation, sanitizeInput, xssProtection } = require('../middleware/validation');

router.use(authenticateToken);

// Profile management
router.get('/profile', userController.getProfile);
router.put('/profile', sanitizeInput, xssProtection, userValidation.updateProfile, userController.updateProfile);
router.put('/password', sanitizeInput, xssProtection, userValidation.changePassword, userController.changePassword);
router.get('/stats', userController.getStats);
router.delete('/account', sanitizeInput, xssProtection, userValidation.deleteAccount, userController.deleteAccount);

module.exports = router;
