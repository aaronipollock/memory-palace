const CustomRoom = require('../models/CustomRoom');
const mongoose = require('mongoose');
const AppError = require('../utils/AppError');
const { BUNDLED_CUSTOM_ROOM_IMAGE_PATH } = require('../config/demoSampleRoom');

function assertDemoAccountImageUrlAllowed(email, imageUrl) {
    if (email !== 'demo@example.com') return;
    const u = imageUrl.trim();
    const allowedBundled = u === BUNDLED_CUSTOM_ROOM_IMAGE_PATH;
    const allowedLocalMarker = u.startsWith('demo-local:');
    if (!allowedBundled && !allowedLocalMarker) {
        throw new AppError(
            'Demo accounts may only use demo-local room images or the bundled sample room image.',
            400
        );
    }
}

// Helper function to check if ID is valid ObjectId format
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// Helper function to validate anchor points
const validateAnchorPoints = (anchorPoints) => {
    if (!Array.isArray(anchorPoints)) {
        return { valid: false, error: 'Anchor points must be an array' };
    }

    for (let i = 0; i < anchorPoints.length; i++) {
        const point = anchorPoints[i];
        if (!point.name || typeof point.name !== 'string' || point.name.trim() === '') {
            return { valid: false, error: `Anchor point ${i + 1}: name is required and must be a non-empty string` };
        }
        if (typeof point.x !== 'number' || isNaN(point.x)) {
            return { valid: false, error: `Anchor point ${i + 1}: x must be a number` };
        }
        if (typeof point.y !== 'number' || isNaN(point.y)) {
            return { valid: false, error: `Anchor point ${i + 1}: y must be a number` };
        }
    }

    return { valid: true };
};

// GET all custom rooms for the authenticated user
exports.getCustomRooms = async (req, res) => {
    // Find all custom rooms that belong to this user
    // req.user.userId comes from the JWT token (set by authenticateToken middleware)
    const customRooms = await CustomRoom.find({
        userId: req.user.userId
    }).sort({ createdAt: -1 }); // Sort by newest first

    res.json(customRooms);
};

// GET a single custom room by ID
exports.getCustomRoomById = async (req, res) => {
    // Validate ID format
    if (!isValidObjectId(req.params.id)) {
        throw new AppError('Invalid room ID format', 400);
    }

    const customRoom = await CustomRoom.findById(req.params.id);

    // Check if room exists
    if (!customRoom) {
        throw new AppError('Custom room not found', 404);
    }

    // Check if user owns this room
    if (customRoom.userId.toString() !== req.user.userId) {
        throw new AppError('Access denied', 403);
    }

    res.json(customRoom);
};

// CREATE a new custom room
exports.createCustomRoom = async (req, res) => {
    // Extract data from request body
    const { name, description, imageUrl, anchorPoints } = req.body;

    // Basic validation
    if (!name || typeof name !== 'string' || name.trim() === '') {
        throw new AppError('Name is required and must be a non-empty string', 400);
    }

    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
        throw new AppError('ImageUrl is required and must be a non-empty string', 400);
    }

    // Length validation
    const MAX_NAME_LENGTH = 200;
    const MAX_DESCRIPTION_LENGTH = 1000;
    const MAX_IMAGE_URL_LENGTH = 500;

    if (name.length > MAX_NAME_LENGTH) {
        throw new AppError(`Name must be less than ${MAX_NAME_LENGTH} characters`, 400);
    }

    if (description && description.length > MAX_DESCRIPTION_LENGTH) {
        throw new AppError(`Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`, 400);
    }

    if (imageUrl.length > MAX_IMAGE_URL_LENGTH) {
        throw new AppError(`ImageUrl must be less than ${MAX_IMAGE_URL_LENGTH} characters`, 400);
    }

    assertDemoAccountImageUrlAllowed(req.user.email, imageUrl);

    // Validate anchor points if provided
    if (anchorPoints !== undefined) {
        const validation = validateAnchorPoints(anchorPoints);
        if (!validation.valid) {
            throw new AppError(validation.error, 400);
        }
    }

    // Create new custom room
    const customRoom = new CustomRoom({
        name: name.trim(),
        description: description ? description.trim() : '', // Optional field
        imageUrl: imageUrl.trim(),
        anchorPoints: anchorPoints || [], // Start with empty array
        userId: req.user.userId, // Set from JWT token
        roomType: 'custom' // Default value
    });

    // Save to database
    await customRoom.save();

    // Return the created room with 201 status (Created)
    res.status(201).json(customRoom);
};

// UPDATE a custom room (e.g., add anchor points)
exports.updateCustomRoom = async (req, res) => {
    // Validate ID format
    if (!isValidObjectId(req.params.id)) {
        throw new AppError('Invalid room ID format', 400);
    }

    const customRoom = await CustomRoom.findById(req.params.id);

    // Check if room exists
    if (!customRoom) {
        throw new AppError('Custom room not found', 404);
    }

    // Check if user owns this room
    if (customRoom.userId.toString() !== req.user.userId) {
        throw new AppError('Access denied', 403);
    }

    // Length validation constants
    const MAX_NAME_LENGTH = 200;
    const MAX_DESCRIPTION_LENGTH = 1000;
    const MAX_IMAGE_URL_LENGTH = 500;

    // Update fields (only update what's provided) with validation
    if (req.body.name !== undefined) {
        if (typeof req.body.name !== 'string' || req.body.name.trim() === '') {
            throw new AppError('Name must be a non-empty string', 400);
        }
        if (req.body.name.length > MAX_NAME_LENGTH) {
            throw new AppError(`Name must be less than ${MAX_NAME_LENGTH} characters`, 400);
        }
        customRoom.name = req.body.name.trim();
    }

    if (req.body.description !== undefined) {
        if (typeof req.body.description !== 'string') {
            throw new AppError('Description must be a string', 400);
        }
        if (req.body.description.length > MAX_DESCRIPTION_LENGTH) {
            throw new AppError(`Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`, 400);
        }
        customRoom.description = req.body.description.trim();
    }

    if (req.body.imageUrl !== undefined) {
        if (typeof req.body.imageUrl !== 'string' || req.body.imageUrl.trim() === '') {
            throw new AppError('ImageUrl must be a non-empty string', 400);
        }
        if (req.body.imageUrl.length > MAX_IMAGE_URL_LENGTH) {
            throw new AppError(`ImageUrl must be less than ${MAX_IMAGE_URL_LENGTH} characters`, 400);
        }
        assertDemoAccountImageUrlAllowed(req.user.email, req.body.imageUrl);
        customRoom.imageUrl = req.body.imageUrl.trim();
    }

    // Handle anchor points - validate before assigning
    if (req.body.anchorPoints !== undefined) {
        const validation = validateAnchorPoints(req.body.anchorPoints);
        if (!validation.valid) {
            throw new AppError(validation.error, 400);
        }
        customRoom.anchorPoints = req.body.anchorPoints;
    }

    // Update the updatedAt timestamp
    customRoom.updatedAt = Date.now();

    // Save changes
    await customRoom.save();

    res.json(customRoom);
};

// DELETE a custom room
exports.deleteCustomRoom = async (req, res) => {
    // Validate ID format
    if (!isValidObjectId(req.params.id)) {
        throw new AppError('Invalid room ID format', 400);
    }

    const customRoom = await CustomRoom.findById(req.params.id);

    // Check if room exists
    if (!customRoom) {
        throw new AppError('Custom room not found', 404);
    }

    // Check if user owns this room
    if (customRoom.userId.toString() !== req.user.userId) {
        throw new AppError('Access denied', 403);
    }

    // Delete the room
    await CustomRoom.findByIdAndDelete(req.params.id);

    res.json({ message: 'Custom room deleted successfully' });
};

// DELETE all custom rooms for demo user (cleanup on logout/leave)
exports.deleteAllDemoCustomRooms = async (req, res) => {
    // Only allow for demo users
    if (req.user.email !== 'demo@example.com') {
        throw new AppError('Access denied. This endpoint is only for demo users.', 403);
    }

    // Delete all custom rooms for this user
    const deleteResult = await CustomRoom.deleteMany({ userId: req.user.userId });

    res.json({
        message: 'All custom rooms deleted successfully',
        deletedCount: deleteResult.deletedCount
    });
};
