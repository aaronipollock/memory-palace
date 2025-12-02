const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const hpp = require('hpp');
const cors = require('cors');

// Rate limiting configuration
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: message || 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: message || 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Speed limiting configuration
const createSpeedLimit = (windowMs, delayAfter, delayMs) => {
  return slowDown({
    windowMs,
    delayAfter,
    delayMs: () => delayMs,
    maxDelayMs: 20000
  });
};

// Security middleware configuration
const securityConfig = {
  // General rate limiting (more generous for MVP)
  generalLimiter: createRateLimit(15 * 60 * 1000, 200, 'Too many requests, please try again later.'),

  // More generous authentication rate limiting for MVP
  authLimiter: createRateLimit(15 * 60 * 1000, 15, 'Too many authentication attempts, please try again later.'),

  // More generous image generation rate limiting for MVP
  imageGenLimiter: createRateLimit(60 * 60 * 1000, 100, 'Image generation limit reached, please try again later.'),

  // Speed limiting for general requests
  speedLimiter: createSpeedLimit(15 * 60 * 1000, 100, 500),

  // CORS configuration
  corsOptions: {
    origin: process.env.NODE_ENV === 'production'
      ? function (origin, callback) {
          // Allow requests with no origin (like mobile apps or curl requests)
          if (!origin) return callback(null, true);

          const allowedOrigins = [
            'https://memory-palace-frontend.onrender.com',
            'https://low-sai.onrender.com',
            'https://low-sai.com',
            'https://www.low-sai.com',
            process.env.FRONTEND_URL
          ].filter(Boolean);

          // Also allow any *.onrender.com subdomain for flexibility during development
          if (origin.endsWith('.onrender.com')) {
            return callback(null, true);
          }

          if (allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
          }
        }
      : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-CSRF-Token'
    ],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 86400 // 24 hours
  },

  // Helmet configuration (relaxed for MVP)
  helmetConfig: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for MVP
        connectSrc: ["'self'", "https://api.openai.com", "https://api.stability.ai"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  },

  // HPP (HTTP Parameter Pollution) configuration
  hppConfig: {
    whitelist: ['associations', 'memorables', 'anchorPoints']
  }
};

// Security middleware setup function
const setupSecurityMiddleware = (app) => {
  // Helmet - Security headers
  app.use(helmet(securityConfig.helmetConfig));

  // CORS
  app.use(cors(securityConfig.corsOptions));

  // HPP - HTTP Parameter Pollution protection
  app.use(hpp(securityConfig.hppConfig));

  // General rate limiting
  app.use(securityConfig.generalLimiter);

  // Speed limiting
  app.use(securityConfig.speedLimiter);

  // Additional security headers
  app.use((req, res, next) => {
    // Remove server information
    res.removeHeader('X-Powered-By');

    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    // Cache control for sensitive routes
    if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/memory-palaces')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    }

    next();
  });
};

// Route-specific security middleware
const routeSecurity = {
  // Authentication routes with stricter rate limiting
  authRoutes: [securityConfig.authLimiter],

  // Image generation routes with specific rate limiting
  imageGenRoutes: [securityConfig.imageGenLimiter],

  // Memory palace routes with general security
  memoryPalaceRoutes: [securityConfig.generalLimiter]
};

module.exports = {
  setupSecurityMiddleware,
  routeSecurity,
  securityConfig
};
