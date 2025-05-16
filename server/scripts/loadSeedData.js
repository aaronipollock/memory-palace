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

// Define the Memory Palace Schema
const memoryPalaceSchema = new mongoose.Schema({
    name: String,
    roomType: String,
    associations: [{
        anchor: String,
        memorable: String,
        description: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    userId: mongoose.Schema.Types.ObjectId,
    isSeedData: Boolean
});

const MemoryPalace = mongoose.model('MemoryPalace', memoryPalaceSchema);

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
                password: 'demo123456'
            });
        }

        // Add userId and isSeedData to each palace
        const palacesWithUser = seedData.map(palace => ({
            ...palace,
            userId: demoUser._id,
            isSeedData: true
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
