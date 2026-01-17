require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];
const firstName = process.argv[4] || undefined;
const lastName = process.argv[5] || undefined;

if (!email || !password) {
    console.error('Usage: node createUser.js <email> <password> [firstName] [lastName]');
    console.error('Example: node createUser.js user@example.com mypassword John Doe');
    process.exit(1);
}

const createUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/memory-palace');
        console.log('Connected to MongoDB');

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists with this email');
            process.exit(0);
        }

        // Create user
        const user = new User({
            email,
            password,
            firstName,
            lastName
        });

        await user.save();
        console.log(`User created successfully: ${email}`);
        if (firstName) {
            console.log(`Name: ${firstName}${lastName ? ' ' + lastName : ''}`);
        }
        process.exit(0);
    } catch (error) {
        console.error('Error creating user:', error);
        process.exit(1);
    }
};

createUser();
