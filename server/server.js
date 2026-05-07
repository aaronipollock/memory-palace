// IMPORTANT: Load Sentry instrumentation before other modules.
require('./instrument.js');

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { logger } = require('./utils/logger');
const { setupSecurityMiddleware, routeSecurity } = require('./config/security');
const { sanitizeInput, xssProtection } = require('./middleware/validation');
const { csrfProtection } = require('./middleware/auth');

const app = express();
// Trust proxy for rate limiting and correct IP handling on Render/Proxies
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5001;

// Fail-fast config validation (production only)
if (process.env.NODE_ENV === 'production') {
  const missing = [];

  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
  if (!process.env.JWT_REFRESH_SECRET) missing.push('JWT_REFRESH_SECRET');

  if (missing.length) {
    throw new Error(`Missing required env var(s): ${missing.join(', ')}`);
  }

  // Optional: basic strength guardrail
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }
  if (process.env.JWT_REFRESH_SECRET.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be at least 32 characters');
  }
}

// Connect to MongoDB with security options
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/memory-palace', {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
})
.then(() => logger.info('MongoDB connected', { eventType: 'startup' }))
.catch(error => logger.error('MongoDB connection error', { error, eventType: 'startup' }));

// Setup security middleware
setupSecurityMiddleware(app);

// Request ID middleware (early in chain for log correlation)
const requestIdMiddleware = require('./middleware/requestId');
app.use(requestIdMiddleware);

// Request logging: one log line per request + req.log with requestId/userId propagation
const requestLoggingMiddleware = require('./middleware/requestLogging');
app.use(requestLoggingMiddleware);

// Cookie parser
app.use(cookieParser());

// Body parser with increased limit for large image data
// Skip body parsing for multipart/form-data (let multer handle it)
const jsonParser = express.json({ limit: '50mb' });
const urlencodedParser = express.urlencoded({ limit: '50mb', extended: true });

app.use((req, res, next) => {
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
        return next(); // Skip body parsing for multipart/form-data
    }
    jsonParser(req, res, next);
});

app.use((req, res, next) => {
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
        return next(); // Skip body parsing for multipart/form-data
    }
    urlencodedParser(req, res, next);
});

// Input sanitization and XSS protection
app.use(sanitizeInput);
app.use(xssProtection);

// Serve static files with security headers
app.use('/public', express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, _filePath) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
}));

// Serve original and optimized images
app.use('/images/original', express.static(path.join(__dirname, 'public/images/original')));
app.use('/images/optimized', express.static(path.join(__dirname, 'public/images/optimized')));
app.use('/images/demo', express.static(path.join(__dirname, 'public/images/demo')));
app.use('/images/user', express.static(path.join(__dirname, 'public/images/user')));

// Auth routes (no CSRF protection needed for login/signup)
const authRoutes = require('./routes/auth');
app.use('/api/auth', ...routeSecurity.authRoutes, authRoutes);

// User routes (with CSRF protection)
const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);

// Feedback routes (no CSRF protection needed for public feedback)
const feedbackRoutes = require('./routes/feedback');
app.use('/api/feedback', feedbackRoutes);

// Image generation routes (no CSRF protection needed for core functionality)
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Health check endpoint for Render
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Dev-only: deterministic endpoint to generate a Sentry trace/transaction
// Requires SENTRY_DSN and SENTRY_TRACES_SAMPLE_RATE (e.g. 1.0) to be set.
if (process.env.NODE_ENV !== 'production') {
  const Sentry = require('@sentry/node');
  app.get('/api/dev/sentry-trace', async (req, res) => {
    await Sentry.startSpan({ name: 'dev sentry trace', op: 'debug' }, async () => {
      await new Promise((r) => setTimeout(r, 150));
      res.status(200).json({ ok: true, message: 'Trace generated. Check Sentry → Traces.' });
    });
  });
}

// Memory palace routes (no CSRF protection needed for core functionality)
const memoryPalaceRoutes = require('./routes/memoryPalaceRoutes');
app.use('/api/memory-palaces', ...routeSecurity.memoryPalaceRoutes, memoryPalaceRoutes);

// Custom room routes (no CSRF protection needed for core functionality)
const customRoomRoutes = require('./routes/customRoomRoutes');
app.use('/api/custom-rooms', ...routeSecurity.customRoomRoutes, customRoomRoutes);

// Image generation routes (must be defined BEFORE CSRF protection)
const roomController = require('./controllers/roomController');
const imageController = require('./controllers/imageController');
const asyncHandler = require('./utils/asyncHandler');
app.post('/api/generate-room', ...routeSecurity.imageGenRoutes, asyncHandler(roomController.generateRoom));
app.post('/api/generate-images', ...routeSecurity.imageGenRoutes, asyncHandler(imageController.generateImages));

// Apply CSRF protection to all other API routes (after auth, feedback, image, and memory palace routes)
app.use('/api', csrfProtection);

// Note: The React frontend is deployed as a separate static service on Render,
// so this API service does not serve the client build.

// Handle 404 for undefined routes (must be before error handlers)
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const Sentry = require('@sentry/node');

app.use(notFoundHandler);

// Sentry error middleware: after all routes / notFoundHandler, before the app error formatter
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// Global error handling middleware (must be last among error handlers)
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info('Server listening', {
    port: PORT,
    env: process.env.NODE_ENV || 'development',
    eventType: 'startup'
  });
});
