const AppError = require('../utils/AppError');
const { logger } = require('../utils/logger');

/**
 * Centralized error handling middleware
 * Handles all errors thrown in the application
 *
 * SECURITY: Never exposes stack traces or internal error details in production
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.statusCode = error.statusCode || err.status || 500;

    // Determine environment - CRITICAL for security
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isProduction = process.env.NODE_ENV === 'production';

    // Log error with context
    const errorContext = {
        requestId: req.id,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        userId: req.user?.id || req.user?._id || null,
        statusCode: error.statusCode,
        message: error.message,
        // Stack only in logs, never in responses (except dev)
        stack: isDevelopment ? err.stack : undefined
    };

    // Handle specific error types
    if (err.name === 'ValidationError') {
        // Mongoose validation error - format as structured array for frontend
        // Do not expose raw Mongoose error paths or internal details
        const validationDetails = Object.keys(err.errors).map(field => ({
            field: field, // Field name (e.g., "name", "roomType")
            message: err.errors[field].message
        }));

        // Create AppError with details array
        error = new AppError('Validation Error', 400, validationDetails);
        logger.warn('Validation Error', errorContext);
    } else if (err.name === 'CastError') {
        // Mongoose bad ObjectId
        const message = `Resource not found with id of ${err.value}`;
        error = new AppError(message, 404);
        logger.warn('Cast Error', errorContext);
    } else if (err.code === 11000) {
        // Mongoose duplicate key error
        const field = Object.keys(err.keyPattern)[0];
        const message = `${field} already exists`;
        error = new AppError(message, 400);
        logger.warn('Duplicate Key Error', errorContext);
    } else if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = new AppError(message, 401);
        logger.security('Invalid JWT Token', errorContext);
    } else if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = new AppError(message, 401);
        logger.security('Expired JWT Token', errorContext);
    } else if (err instanceof AppError) {
        // Operational error (expected errors)
        if (error.statusCode >= 500) {
            logger.error('Application Error', errorContext);
        } else {
            logger.warn('Application Error', errorContext);
        }
    } else {
        // Programming or unknown errors (unexpected)
        logger.error('Unexpected Error', {
            ...errorContext,
            errorName: err.name,
            errorCode: err.code
        });
    }

    // Build error response
    // CRITICAL SECURITY: Stack traces and internal details ONLY in development
    const response = {
        success: false,
        error: error.message || 'Internal Server Error',
        requestId: req.id
    };

    // Only include details if provided (and safe for production)
    if (error.details) {
        response.details = error.details;
    }

    // Stack traces ONLY in development - NEVER in production
    // Double-check to prevent accidental exposure
    if (isDevelopment && !isProduction) {
        response.stack = err.stack;
        // Original error message only for 500 errors in development
        if (error.statusCode === 500) {
            response.originalError = err.message;
        }
    }

    // Safety check: Ensure stack is never included in production
    if (isProduction && response.stack) {
        delete response.stack;
        delete response.originalError;
        logger.error('SECURITY WARNING: Attempted to include stack trace in production response', {
            requestId: req.id,
            url: req.originalUrl
        });
    }

    res.status(error.statusCode).json(response);
};

/**
 * Handle 404 errors for undefined routes
 */
const notFoundHandler = (req, res, next) => {
    const error = new AppError(`Route ${req.originalUrl} not found`, 404);
    logger.warn('Route Not Found', {
        requestId: req.id,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip
    });
    next(error);
};

module.exports = {
    errorHandler,
    notFoundHandler
};
