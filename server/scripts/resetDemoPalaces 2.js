const mongoose = require('mongoose');
const MemoryPalace = require('../models/MemoryPalace');
const User = require('../models/User');

const resetDemoPalaces = async () => {
    try {
        // Connect to MongoDB (only if not already connected)
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/memory-palace');
            console.log('Connected to MongoDB');
        }

        // Find demo user
        const demoUser = await User.findOne({ email: 'demo@example.com' });
        if (!demoUser) {
            console.log('Demo user not found.');
            throw new Error('Demo user not found');
        }

        // Delete all demo palaces (including any modifications)
        await MemoryPalace.deleteMany({
            userId: demoUser._id,
            isSeedData: true
        });
        console.log('Deleted all demo palaces');

        // Recreate demo palaces from scratch
        const { createDemoPalaces } = require('./createDemoPalaces');
        await createDemoPalaces();

        console.log('✅ Demo palaces reset successfully');

        // Only exit if this is the main module (standalone script)
        if (require.main === module) {
            process.exit(0);
        }
    } catch (error) {
        console.error('Error resetting demo palaces:', error);
        if (require.main === module) {
            process.exit(1);
        }
        throw error; // Re-throw for calling modules
    }
};

// Export for use in other files
module.exports = { resetDemoPalaces };

// Run the script if called directly
if (require.main === module) {
    resetDemoPalaces();
}
