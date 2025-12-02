const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    firstName: {
        type: String,
        trim: true,
        maxlength: 50
    },
    lastName: {
        type: String,
        trim: true,
        maxlength: 50
    },
    username: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        sparse: true
    },

    preferences: {
        room: {
            type: String,
            enum: ['throne room', 'bedchamber', 'dungeon', 'great hall', 'chapel', 'kitchen'],
            default: 'throne room'
        },
        artStyle: {
            type: String,
            enum: ['Random', 'Digital Art', 'Cartoon', '3D Render', 'Watercolor', 'Pop Art', 'Photorealistic'],
            default: 'Digital Art'
        },
        // theme: {
        //     type: String,
        //     enum: ['light', 'dark', 'auto'],
        //     default: 'light'
        // }
    },

    isEmailVerified: {
        type: Boolean,
        default: false
    },
    lastLoginAt: Date,

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// updatedAt middleware
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
