require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const updateDemoUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/memory-palace');
        console.log('Connected to MongoDB');

        // Find the demo user
        const existingUser = await User.findOne({ email: 'demo@example.com' });
        if (!existingUser) {
            console.log('Demo user does not exist. Creating new demo user...');
            const demoUser = new User({
                email: 'demo@example.com',
                password: 'demo123'
            });
            await demoUser.save();
            console.log('Demo user created successfully with strong password');
        } else {
            // Update the existing user's password
            existingUser.password = 'demo123';
            await existingUser.save();
            console.log('Demo user password updated successfully');
        }

        console.log('Demo credentials:');
        console.log('Email: demo@example.com');
        console.log('Password: demo123');
        process.exit(0);
    } catch (error) {
        console.error('Error updating demo user:', error);
        process.exit(1);
    }
};

updateDemoUser();
