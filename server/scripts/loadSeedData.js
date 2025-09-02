require('dotenv').config();
const mongoose = require('mongoose');
const MemoryPalace = require('../models/MemoryPalace');
const User = require('../models/User');
const seedData = require('../data/seedData');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/memory-palace', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Function to load seed data
const loadSeedData = async () => {
    try {
        // Clear existing memory palaces
        await MemoryPalace.deleteMany({});
        console.log('Cleared existing memory palaces');

        // Get or create demo user
        let demoUser = await User.findOne({ email: 'demo@example.com' });
        if (!demoUser) {
            demoUser = await User.create({
                email: 'demo@example.com',
                password: 'demo123'
            });
        }

        // Convert seed data object to array of palaces
        const palacesWithUser = Object.entries(seedData).map(([name, data]) => ({
            name,
            roomType: data.roomType,
            associations: data.associations.map(assoc => ({
                anchor: assoc.anchor,
                memorableItem: assoc.memorable,
                description: assoc.description
            })),
            userId: demoUser._id,
            isSeedData: true,
            createdAt: new Date()
        }));

        // Insert seed data
        await MemoryPalace.insertMany(palacesWithUser);
        console.log('Successfully loaded seed data');

        // Log created memory palaces
        const createdPalaces = await MemoryPalace.find({ isSeedData: true });
        console.log('Created memory palaces:', createdPalaces.map(p => p.name));

    } catch (error) {
        console.error('Error loading seed data:', error);
    } finally {
        mongoose.disconnect();
    }
};

// Run the seed function
loadSeedData();
