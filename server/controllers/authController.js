const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, jwtConfig } = require('../config/jwt');

// Signup controller
exports.signup = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                error: 'User already exists',
                code: 'USER_EXISTS'
            });
        }

        // Create new user
        const user = new User({
            email,
            password
        });

        await user.save();

        // Generate tokens
        const accessToken = generateAccessToken(user._id, user.email);
        const refreshToken = generateRefreshToken(user._id);

        // Set refresh token as HTTP-only cookie
        res.cookie('refreshToken', refreshToken, jwtConfig.refreshCookieOptions);

        res.status(201).json({
            message: 'User created successfully',
            accessToken,
            user: {
                id: user._id,
                email: user.email
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

        // Set refresh token as HTTP-only cookie
        res.cookie('refreshToken', refreshToken, jwtConfig.refreshCookieOptions);

        res.json({
            message: 'Login successful',
            accessToken,
            user: {
                id: user._id,
                email: user.email
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
