require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
    console.error('Usage: node deleteUser.js <email>');
    console.error('Example: node deleteUser.js user@example.com');
    process.exit(1);
}

const deleteUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/memory-palace');
        console.log('Connected to MongoDB');

        // Find and delete user
        const result = await User.deleteOne({ email: email.toLowerCase() });

        if (result.deletedCount === 0) {
            console.error(`User with email ${email} not found`);
            process.exit(1);
        }

        console.log(`User deleted successfully: ${email}`);
        process.exit(0);
    } catch (error) {
        console.error('Error deleting user:', error);
        process.exit(1);
    }
};

deleteUser();
