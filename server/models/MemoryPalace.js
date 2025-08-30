const mongoose = require('mongoose');

const memoryPalaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    roomType: {
        type: String,
        required: true,
        enum: ['throne room', 'bedchamber', 'dungeon', 'great hall', 'chapel', 'kitchen']
    },
    associations: [{
        anchor: {
            type: String,
            required: true
        },
        memorableItem: {
            type: String,
            required: false,
            default: ''
        },
        description: {
            type: String,
            required: false,
            default: ''
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
    acceptedImages: {
        type: Map,
        of: {
            image: String,
            prompt: String,
            association: {
                anchor: String,
                memorableItem: String
            },
            timestamp: Date
        },
        default: {}
    },
    completionStatus: {
        totalAnchors: {
            type: Number,
            default: 0
        },
        acceptedImages: {
            type: Number,
            default: 0
        },
        isComplete: {
            type: Boolean,
            default: false
        },
        progressPercentage: {
            type: Number,
            default: 0
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('MemoryPalace', memoryPalaceSchema);
