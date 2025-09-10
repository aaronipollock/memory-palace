const mongoose = require('mongoose');
const MemoryPalace = require('../models/MemoryPalace');
const User = require('../models/User');
const { createDemoPalaces } = require('./createDemoPalaces');

const fastResetDemoPalaces = async () => {
    try {
        // Connect to MongoDB (only if not already connected)
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/memory-palace');
        }

        // Find demo user
        const demoUser = await User.findOne({ email: 'demo@example.com' });
        if (!demoUser) {
            console.log('Demo user not found.');
            throw new Error('Demo user not found');
        }

        // Check existing palaces before deletion
        const existingPalaces = await MemoryPalace.find({ userId: demoUser._id });
        console.log(`Found ${existingPalaces.length} existing palaces for demo user`);
        existingPalaces.forEach(palace => {
            console.log(`- ${palace.name} (isSeedData: ${palace.isSeedData})`);
        });

        // Delete ALL palaces for demo user (not just isSeedData ones)
        const deletedCount = await MemoryPalace.deleteMany({
            userId: demoUser._id
        });
        console.log(`Deleted ${deletedCount.deletedCount} demo palaces`);

                // Use the original createDemoPalaces function to restore with AI images
        await createDemoPalaces();

        console.log('✅ Demo palaces reset successfully with AI images');

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
module.exports = { fastResetDemoPalaces };

// Run the script if called directly
if (require.main === module) {
    fastResetDemoPalaces();
}
