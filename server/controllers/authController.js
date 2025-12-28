const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, jwtConfig } = require('../config/jwt');
const crypto = require('crypto');

// Generate CSRF token
const generateCSRFToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Signup controller
exports.signup = async (req, res) => {
    try {
        const { email, password, firstName, lastName, username } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                error: 'User already exists',
                code: 'USER_EXISTS'
            });
        }

        // Check if username is taken (if provided)
        if (username) {
            const existingUsername = await User.findOne({ username: username.toLowerCase() });
            if (existingUsername) {
                return res.status(400).json({
                    error: 'Username already taken',
                    code: 'USERNAME_EXISTS'
                });
            }
        }

        // Create new user
        const user = new User({
            email,
            password,
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            username: username ? username.toLowerCase() : undefined
        });

        await user.save();

        // Generate tokens
        const accessToken = generateAccessToken(user._id, user.email);
        const refreshToken = generateRefreshToken(user._id);
        const csrfToken = generateCSRFToken();

        // Set refresh token as HTTP-only cookie
        res.cookie('refreshToken', refreshToken, jwtConfig.refreshCookieOptions);

        // Set CSRF token as non-HTTP-only cookie (for double-submit pattern)
        res.cookie('csrfToken', csrfToken, {
            sameSite: 'lax', // Changed from 'strict' to 'lax' for cross-port development
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/', // Ensure cookie is available for all paths
            domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost' // Allow cross-port in development
        });

        res.status(201).json({
            message: 'User created successfully',
            accessToken,
            csrfToken,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                preferences: user.preferences
            }
        });
    } catch (error) {
        console.error('Signup error:', error);

        // Don't leak sensitive information
        if (process.env.NODE_ENV === 'production') {
            res.status(500).json({
                error: 'Error creating user',
                code: 'SIGNUP_ERROR'
            });
        } else {
            res.status(500).json({
                error: 'Error creating user',
                details: error.message,
                code: 'SIGNUP_ERROR'
            });
        }
    }
};

// Login controller
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                error: 'Invalid credentials',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user._id, user.email);
        const refreshToken = generateRefreshToken(user._id);
        const csrfToken = generateCSRFToken();

        // Set refresh token as HTTP-only cookie
        res.cookie('refreshToken', refreshToken, jwtConfig.refreshCookieOptions);

        // Set CSRF token as non-HTTP-only cookie (for double-submit pattern)
        res.cookie('csrfToken', csrfToken, {
            sameSite: 'lax', // Changed from 'strict' to 'lax' for cross-port development
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/', // Ensure cookie is available for all paths
            domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost' // Allow cross-port in development
        });

        res.json({
            message: 'Login successful',
            accessToken,
            csrfToken,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                preferences: user.preferences
            }
        });
    } catch (error) {
        console.error('Login error:', error);

        // Don't leak sensitive information
        if (process.env.NODE_ENV === 'production') {
            res.status(500).json({
                error: 'Error logging in',
                code: 'LOGIN_ERROR'
            });
        } else {
            res.status(500).json({
                error: 'Error logging in',
                details: error.message,
                code: 'LOGIN_ERROR'
            });
        }
    }
};

// Logout controller
exports.logout = async (req, res) => {
    try {
        const { email } = req.user; // Get user from JWT token

        // Clear cookies
        res.clearCookie('refreshToken', {
            path: '/api/auth/refresh',
            domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : 'localhost'
        });
        res.clearCookie('csrfToken', {
            path: '/',
            domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : 'localhost'
        });

        // If this is the demo user, reset demo palaces and delete custom rooms
        if (email === 'demo@example.com') {
            try {
                // Use the smart reset function that reuses existing AI images
                const { smartResetDemoPalaces } = require('../scripts/smartResetDemoPalaces');
                await smartResetDemoPalaces();
                console.log('Demo palaces reset on logout (smart)');

                // Delete all custom rooms for demo user
                const CustomRoom = require('../models/CustomRoom');
                const User = require('../models/User');
                const demoUser = await User.findOne({ email: 'demo@example.com' });
                if (demoUser) {
                    const deleteResult = await CustomRoom.deleteMany({ userId: demoUser._id });
                    console.log(`Deleted ${deleteResult.deletedCount} custom rooms for demo user on logout`);
                }
            } catch (resetError) {
                console.error('Error resetting demo data:', resetError);
                // Don't fail the logout if reset fails
            }
        }

        res.json({
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            error: 'Error during logout',
            code: 'LOGOUT_ERROR'
        });
    }
};
