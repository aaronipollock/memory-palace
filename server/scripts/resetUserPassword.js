require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Get email and new password from command line arguments
const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
    console.error('Usage: node resetUserPassword.js <email> <newPassword>');
    console.error('Example: node resetUserPassword.js user@example.com newpassword123');
    process.exit(1);
}

const resetPassword = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/memory-palace');
        console.log('Connected to MongoDB');

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            console.error(`User with email ${email} not found`);
            process.exit(1);
        }

        // Update password (will be hashed automatically by pre-save hook)
        user.password = newPassword;
        await user.save();

        console.log(`Password reset successfully for: ${email}`);
        process.exit(0);
    } catch (error) {
        console.error('Error resetting password:', error);
        process.exit(1);
    }
};

resetPassword();
