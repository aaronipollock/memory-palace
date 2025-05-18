const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '7d'
        }
    );
};

// Signup controller
exports.signup = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = new User({
            email,
            password
        });

        await user.save();

        // Generate token
        const token = generateToken(user);

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user._id,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

// Login controller
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};
