require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createDemoUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/memory-palace');
        console.log('Connected to MongoDB');

        // Check if demo user already exists
        const existingUser = await User.findOne({ email: 'demo@example.com' });
        if (existingUser) {
            console.log('Demo user already exists');
            process.exit(0);
        }

        // Create demo user
        const demoUser = new User({
            email: 'demo@example.com',
            password: 'demo123456'
        });

        await demoUser.save();
        console.log('Demo user created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating demo user:', error);
        process.exit(1);
    }
};

createDemoUser();
