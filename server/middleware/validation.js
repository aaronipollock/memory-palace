const { body, validationResult, sanitizeBody } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Authentication validation rules
const authValidation = {
  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address')
      .isLength({ max: 254 })
      .withMessage('Email is too long'),

    body('password')
      .isLength({ min: 6 }) // Relaxed from 8 to 6 for MVP
      .withMessage('Password must be at least 6 characters long'),

    handleValidationErrors
  ],

  signup: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address')
      .isLength({ max: 254 })
      .withMessage('Email is too long'),

    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),

    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        }
        return true;
      }),

    handleValidationErrors
  ]
};

// User validation rules
const userValidation = {
  updateProfile: [
    body('firstName')
      .optional()
      .custom((value) => {
        // If value is undefined, skip validation (field not sent)
        if (value === undefined) {
          return true;
        }
        // Allow null/empty to clear firstName
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return true;
        }
        // If provided, validate it
        const trimmed = typeof value === 'string' ? value.trim() : String(value).trim();
        if (trimmed.length < 1 || trimmed.length > 50) {
          throw new Error('First name must be between 1 and 50 characters');
        }
        return true;
      }),

    body('lastName')
      .optional()
      .custom((value) => {
        // If value is undefined, skip validation (field not sent)
        if (value === undefined) {
          return true;
        }
        // Allow null/empty to clear lastName
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return true;
        }
        // If provided, validate it
        const trimmed = typeof value === 'string' ? value.trim() : String(value).trim();
        if (trimmed.length < 1 || trimmed.length > 50) {
          throw new Error('Last name must be between 1 and 50 characters');
        }
        return true;
      }),

    body('username')
      .optional()
      .custom((value) => {
        // If value is undefined, skip validation (field not sent)
        if (value === undefined) {
          return true;
        }
        // Allow null/empty to clear username
        if (value === null || value === '' || (typeof value === 'string' && value.trim() === '')) {
          return true;
        }
        // If provided, validate it
        const trimmed = typeof value === 'string' ? value.trim() : String(value).trim();
        if (trimmed.length < 3 || trimmed.length > 30) {
          throw new Error('Username must be between 3 and 30 characters');
        }
        if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
          throw new Error('Username can only contain letters, numbers, and underscores');
        }
        return true;
      }),

    body('preferences.room')
      .optional()
      .isIn(['throne room', 'bedchamber', 'dungeon', 'great hall', 'chapel', 'kitchen'])
      .withMessage('Invalid room preference'),

    body('preferences.artStyle')
      .optional()
      .isIn(['Random', 'Digital Art', 'Cartoon', '3D Render', 'Watercolor', 'Pop Art', 'Photorealistic'])
      .withMessage('Invalid art style preference'),

    handleValidationErrors
  ],

  changePassword: [
    body('currentPassword')
      .isLength({ min: 6 })
      .withMessage('Current password is required'),

    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long'),

    handleValidationErrors
  ],

  deleteAccount: [
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password is required for account deletion'),

    handleValidationErrors
  ]
};

// Memory palace validation rules
const memoryPalaceValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Palace name must be between 1 and 100 characters'),

    body('roomType')
      .isIn(['throne room', 'bedchamber', 'dungeon', 'great hall', 'chapel', 'kitchen'])
      .withMessage('Invalid room type'),

    body('associations')
      .isArray({ min: 1, max: 20 })
      .withMessage('Must provide between 1 and 20 associations'),

    body('associations.*.anchor')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Anchor must be between 1 and 50 characters'),

    body('associations.*.memorableItem')
      .optional()
      .trim()
      .isLength({ min: 0, max: 100 })
      .withMessage('Memorable item must be between 0 and 100 characters'),

    body('associations.*.description')
      .optional()
      .trim()
      .isLength({ min: 0, max: 500 })
      .withMessage('Description must be between 0 and 500 characters'),

    handleValidationErrors
  ],

  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Palace name must be between 1 and 100 characters'),

    handleValidationErrors
  ]
};

// Image generation validation rules
const imageGenerationValidation = {
  generateImages: [
    body('anchorPoints')
      .isArray({ min: 1, max: 20 })
      .withMessage('Must provide between 1 and 20 anchor points'),

    body('anchorPoints.*')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Anchor point must be between 1 and 50 characters'),

    body('memorables')
      .isArray({ min: 1, max: 20 })
      .withMessage('Must provide between 1 and 20 memorable items'),

    body('memorables.*')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Memorable item must be between 1 and 100 characters'),

    body('roomType')
      .optional()
      .isIn(['throne room', 'bedchamber', 'dungeon', 'great hall', 'chapel', 'kitchen'])
      .withMessage('Invalid room type'),

    body('artStyle')
      .optional()
      .isIn(['Random', 'Digital Art', 'Cartoon', '3D Render', 'Watercolor', 'Pop Art', 'Photorealistic'])
      .withMessage('Invalid art style'),

    handleValidationErrors
  ],

  generateImage: [
    body('prompt')
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Prompt must be between 1 and 1000 characters'),

    body('association')
      .isObject()
      .withMessage('Association must be an object'),

    body('association.anchor')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Anchor must be between 1 and 50 characters'),

    body('association.memorableItem')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Memorable item must be between 1 and 100 characters'),

    handleValidationErrors
  ]
};

// Feedback validation rules
const feedbackValidation = {
  submit: [
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),

    body('feedback')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Feedback must be less than 2000 characters'),

    body('email')
      .optional()
      .custom((value) => {
        if (value === '' || value === null || value === undefined) {
          return true; // Allow empty values
        }
        // Only validate if a value is provided
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          throw new Error('Please provide a valid email address');
        }
        return true;
      })
      .normalizeEmail(),

    body('timestamp')
      .isISO8601()
      .withMessage('Invalid timestamp format'),

    body('userAgent')
      .optional()
      .isLength({ max: 500 })
      .withMessage('User agent is too long'),

    body('url')
      .optional()
      .custom((value) => {
        if (value === '' || value === null || value === undefined) {
          return true; // Allow empty values
        }
        // Simple check for URL-like strings (allows localhost)
        if (typeof value === 'string' && value.length > 0) {
          return true;
        }
        throw new Error('Invalid URL format');
      }),

    handleValidationErrors
  ]
};

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Sanitize all string inputs
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    });
  }

  next();
};

// XSS protection middleware (MVP-friendly)
const xssProtection = (req, res, next) => {
  // Basic XSS protection for common attack vectors
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    }
    return value;
  };

  // Recursively sanitize objects
  const sanitizeObject = (obj) => {
    if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string') {
          obj[key] = sanitizeValue(obj[key]);
        } else if (typeof obj[key] === 'object') {
          sanitizeObject(obj[key]);
        }
      });
    }
  };

  sanitizeObject(req.body);
  sanitizeObject(req.query);

  next();
};

module.exports = {
  authValidation,
  userValidation,
  memoryPalaceValidation,
  imageGenerationValidation,
  feedbackValidation,
  sanitizeInput,
  xssProtection,
  handleValidationErrors
};
