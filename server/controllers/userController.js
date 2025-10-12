const MemoryPalace = require('../models/MemoryPalace');
const User = require('../models/User');

// GET /api/user/profile - Get user profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId)
            .select('-password -__v');

            if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.json({
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            createdAt: user.createdAt,
            preferences: user.preferences,
            updatedAt: user.updatedAt
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

// PUT /api/user/profile - Update user profile
exports.updateProfile = async (req, res) => {
    try {
      const userId = req.user.userId;
      const { firstName, lastName, preferences, username, email } = req.body;

      // Prevent updates to protected fields
      if (username || email) {
        return res.status(400).json({
          error: 'Username and email cannot be changed from this route',
          code: 'IMMUTABLE_FIELDS'
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;

      if (preferences) {
        if (preferences.room !== undefined) {
          user.preferences.room = preferences.room;
        }
        if (preferences.artStyle !== undefined) {
          user.preferences.artStyle = preferences.artStyle;
        }
      }

      await user.save();

      return res.json({
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
    } catch (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
  };

// GET /api/user/stats - Get user statistics
exports.getStats = async (req, res) => {
    try {
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
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            error: 'Failed to retrieve statistics',
            code: 'STATS_FETCH_ERROR'
        });
    }
};

// DELETE /api/user/account - Delete user account
exports.deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        // Verify password before deletion
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({
                error: 'Password is incorrect',
                code: 'INVALID_PASSWORD'
            });
        }

        // Delete user's memory palaces
        await MemoryPalace.deleteMany({ userId: userId });

        // Delete user account
        await User.findByIdAndDelete(userId);

        res.json({
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            error: 'Failed to delete account',
            code: 'ACCOUNT_DELETE_ERROR'
        });
    }
};
