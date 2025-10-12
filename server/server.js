require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { setupSecurityMiddleware, routeSecurity } = require('./config/security');
const { sanitizeInput, xssProtection } = require('./middleware/validation');
const { csrfProtection } = require('./middleware/auth');

const app = express();
// Trust proxy for rate limiting and correct IP handling on Render/Proxies
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5001;

// Connect to MongoDB with security options
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/memory-palace', {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Setup security middleware
setupSecurityMiddleware(app);

// Cookie parser
app.use(cookieParser());

// Body parser with increased limit for large image data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Input sanitization and XSS protection
app.use(sanitizeInput);
app.use(xssProtection);

// Serve static files with security headers
app.use('/public', express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
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

// Memory palace routes (no CSRF protection needed for core functionality)
const memoryPalaceRoutes = require('./routes/memoryPalaceRoutes');
app.use('/api/memory-palaces', ...routeSecurity.memoryPalaceRoutes, memoryPalaceRoutes);

// Apply CSRF protection to all other API routes (after auth, feedback, image, and memory palace routes)
app.use('/api', csrfProtection);

const roomController = require('./controllers/roomController');
app.post('/api/generate-room', ...routeSecurity.imageGenRoutes, roomController.generateRoom);

// Serve React app in production with security headers
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, '../client/build'), {
    setHeaders: (res, path) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }));

  // Handle any requests that don't match the ones above
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
  } else {
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error', stack: err.stack });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
