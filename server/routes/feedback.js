const express = require('express');
const { submitFeedback } = require('../controllers/feedbackController');
const { feedbackValidation } = require('../middleware/validation');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// POST /api/feedback - Submit user feedback
router.post('/', feedbackValidation.submit, asyncHandler(submitFeedback));

module.exports = router;
