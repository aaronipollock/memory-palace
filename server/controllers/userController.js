const MemoryPalace = require('../models/MemoryPalace');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// GET /api/user/profile - Get user profile
exports.getProfile = async (req, res) => {
    const userId = req.user.userId;

    const user = await User.findById(userId)
        .select('-password -__v');

    if (!user) {
        throw new AppError('User not found', 404);
    }

    res.json({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        createdAt: user.createdAt,
        preferences: user.preferences,
        updatedAt: user.updatedAt
    });
};

// PUT /api/user/profile - Update user profile
exports.updateProfile = async (req, res) => {
    const userId = req.user.userId;
    const { firstName, lastName, preferences, username, email } = req.body;

    // Prevent updates to protected fields
    if (email) {
        throw new AppError('Email cannot be changed from this route', 400);
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;

    // Handle username update with uniqueness check
    if (username !== undefined) {
        const trimmedUsername = username ? username.trim().toLowerCase() : null;

        // If setting a username, check if it's taken by another user
        if (trimmedUsername) {
            const existingUser = await User.findOne({
                username: trimmedUsername,
                _id: { $ne: userId } // Exclude current user
            });

            if (existingUser) {
                throw new AppError('Username already taken', 400);
            }
            user.username = trimmedUsername;
        } else {
            // Allow clearing username (setting to null)
            user.username = undefined;
        }
    }

    if (preferences) {
        if (preferences.room !== undefined) {
            user.preferences.room = preferences.room;
        }
        if (preferences.artStyle !== undefined) {
            user.preferences.artStyle = preferences.artStyle;
        }
    }

    await user.save();

    res.json({
        message: 'Profile updated successfully',
        user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            preferences: user.preferences,
            updatedAt: user.updatedAt
        }
    });
};

// PUT /api/user/password - Change password
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
        throw new AppError('Current password is incorrect', 400);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
        message: 'Password changed successfully'
    });
};

// GET /api/user/stats - Get user statistics
exports.getStats = async (req, res) => {
    const userId = req.user.userId;

    // Get memory palace statistics
    const palaceStats = await MemoryPalace.aggregate([
        { $match: { userId: userId } },
        {
            $group: {
                _id: null,
                totalPalaces: { $sum: 1 },
                totalImages: { $sum: '$completionStatus.acceptedImages' },
                completedPalaces: {
                    $sum: {
                        $cond: ['$completionStatus.isComplete', 1, 0]
                    }
                }
            }
        }
    ]);

    const stats = palaceStats[0] || {
        totalPalaces: 0,
        totalImages: 0,
        completedPalaces: 0
    };

    res.json({
        stats: {
            ...stats,
            accountAge: Math.floor((Date.now() - req.user.createdAt) / (1000 * 60 * 60 * 24))
        }
    });
};

// DELETE /api/user/account - Delete user account
exports.deleteAccount = async (req, res) => {
    const { password } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    // Verify password before deletion
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        throw new AppError('Password is incorrect', 400);
    }

    // Delete user's memory palaces
    await MemoryPalace.deleteMany({ userId: userId });

    // Delete user account
    await User.findByIdAndDelete(userId);

    res.json({
        message: 'Account deleted successfully'
    });
};
