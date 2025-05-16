require('dotenv').config();
const mongoose = require('mongoose');
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
    }
});

const MemoryPalace = mongoose.model('MemoryPalace', memoryPalaceSchema);

// Function to load seed data
async function loadSeedData() {
    try {
        // Clear existing data
        await MemoryPalace.deleteMany({});
        console.log('Cleared existing memory palaces');

        // Insert new seed data
        const palaces = Object.entries(seedData).map(([name, data]) => ({
            name,
            roomType: data.roomType,
            associations: data.associations
        }));

        await MemoryPalace.insertMany(palaces);
        console.log('Successfully loaded seed data');

        // Log the created memory palaces
        const createdPalaces = await MemoryPalace.find();
        console.log('Created memory palaces:', createdPalaces.map(p => p.name));

    } catch (error) {
        console.error('Error loading seed data:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Run the seed function
loadSeedData();
