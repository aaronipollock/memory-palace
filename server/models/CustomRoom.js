const mongoose = require('mongoose');

const customRoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false // Optional
    },
    roomType: {
        type: String,
        required: true,
        enum: ['custom'], // Expand later
        default: 'custom'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    anchorPoints: [{
        name: {
            type: String,
            required: true
        },
        x: {
            type: Number,
            required: true
        },
        y: {
            type: Number,
            required: true
        },
        description: {
            type: String,
            required: false
        },
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CustomRoom', customRoomSchema);
