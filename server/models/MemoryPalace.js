const mongoose = require('mongoose');

const memoryPalaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    roomType: {
        type: String,
        required: true,
        enum: ['throne room', 'bedchamber', 'dungeon']
    },
    associations: [{
        anchor: {
            type: String,
            required: true
        },
        memorableItem: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        }
    }],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isSeedData: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('MemoryPalace', memoryPalaceSchema);
