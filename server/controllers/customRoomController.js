const CustomRoom = require('../models/CustomRoom');
const mongoose = require('mongoose');

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
    try {
        // Find all custom rooms that belong to this user
        // req.user.userId comes from the JWT token (set by authenticateToken middleware)
        const customRooms = await CustomRoom.find({
            userId: req.user.userId
        }).sort({ createdAt: -1 }); // Sort by newest first

        res.json(customRooms);
    } catch (error) {
        console.error('Error fetching custom rooms:', error);
        res.status(500).json({ error: 'Failed to fetch custom rooms' });
    }
};

// GET a single custom room by ID
exports.getCustomRoomById = async (req, res) => {
    try {
        // Validate ID format
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'Invalid room ID format' });
        }

        const customRoom = await CustomRoom.findById(req.params.id);

        // Check if room exists
        if (!customRoom) {
            return res.status(404).json({ error: 'Custom room not found' });
        }

        // Check if user owns this room
        if (customRoom.userId.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(customRoom);
    } catch (error) {
        console.error('Error fetching custom room:', error);
        res.status(500).json({ error: 'Failed to fetch custom room' });
    }
};

// CREATE a new custom room
exports.createCustomRoom = async (req, res) => {
    try {
        // Extract data from request body
        const { name, description, imageUrl, anchorPoints } = req.body;

        // Basic validation
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({
                error: 'Name is required and must be a non-empty string'
            });
        }

        if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
            return res.status(400).json({
                error: 'ImageUrl is required and must be a non-empty string'
            });
        }

        // Length validation
        const MAX_NAME_LENGTH = 200;
        const MAX_DESCRIPTION_LENGTH = 1000;
        const MAX_IMAGE_URL_LENGTH = 500;

        if (name.length > MAX_NAME_LENGTH) {
            return res.status(400).json({
                error: `Name must be less than ${MAX_NAME_LENGTH} characters`
            });
        }

        if (description && description.length > MAX_DESCRIPTION_LENGTH) {
            return res.status(400).json({
                error: `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`
            });
        }

        if (imageUrl.length > MAX_IMAGE_URL_LENGTH) {
            return res.status(400).json({
                error: `ImageUrl must be less than ${MAX_IMAGE_URL_LENGTH} characters`
            });
        }

        // Validate anchor points if provided
        if (anchorPoints !== undefined) {
            const validation = validateAnchorPoints(anchorPoints);
            if (!validation.valid) {
                return res.status(400).json({ error: validation.error });
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
    } catch (error) {
        console.error('Error creating custom room:', error);
        res.status(500).json({ error: 'Failed to create custom room' });
    }
};

// UPDATE a custom room (e.g., add anchor points)
exports.updateCustomRoom = async (req, res) => {
    try {
        // Validate ID format
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'Invalid room ID format' });
        }

        const customRoom = await CustomRoom.findById(req.params.id);

        // Check if room exists
        if (!customRoom) {
            return res.status(404).json({ error: 'Custom room not found' });
        }

        // Check if user owns this room
        if (customRoom.userId.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Length validation constants
        const MAX_NAME_LENGTH = 200;
        const MAX_DESCRIPTION_LENGTH = 1000;
        const MAX_IMAGE_URL_LENGTH = 500;

        // Update fields (only update what's provided) with validation
        if (req.body.name !== undefined) {
            if (typeof req.body.name !== 'string' || req.body.name.trim() === '') {
                return res.status(400).json({ error: 'Name must be a non-empty string' });
            }
            if (req.body.name.length > MAX_NAME_LENGTH) {
                return res.status(400).json({ error: `Name must be less than ${MAX_NAME_LENGTH} characters` });
            }
            customRoom.name = req.body.name.trim();
        }

        if (req.body.description !== undefined) {
            if (typeof req.body.description !== 'string') {
                return res.status(400).json({ error: 'Description must be a string' });
            }
            if (req.body.description.length > MAX_DESCRIPTION_LENGTH) {
                return res.status(400).json({ error: `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters` });
            }
            customRoom.description = req.body.description.trim();
        }

        if (req.body.imageUrl !== undefined) {
            if (typeof req.body.imageUrl !== 'string' || req.body.imageUrl.trim() === '') {
                return res.status(400).json({ error: 'ImageUrl must be a non-empty string' });
            }
            if (req.body.imageUrl.length > MAX_IMAGE_URL_LENGTH) {
                return res.status(400).json({ error: `ImageUrl must be less than ${MAX_IMAGE_URL_LENGTH} characters` });
            }
            customRoom.imageUrl = req.body.imageUrl.trim();
        }

        // Handle anchor points - validate before assigning
        if (req.body.anchorPoints !== undefined) {
            const validation = validateAnchorPoints(req.body.anchorPoints);
            if (!validation.valid) {
                return res.status(400).json({ error: validation.error });
            }
            customRoom.anchorPoints = req.body.anchorPoints;
        }

        // Update the updatedAt timestamp
        customRoom.updatedAt = Date.now();

        // Save changes
        await customRoom.save();

        res.json(customRoom);
    } catch (error) {
        console.error('Error updating custom room:', error);
        res.status(500).json({ error: 'Failed to update custom room' });
    }
};

// DELETE a custom room
exports.deleteCustomRoom = async (req, res) => {
    try {
        // Validate ID format
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'Invalid room ID format' });
        }

        const customRoom = await CustomRoom.findById(req.params.id);

        // Check if room exists
        if (!customRoom) {
            return res.status(404).json({ error: 'Custom room not found' });
        }

        // Check if user owns this room
        if (customRoom.userId.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Delete the room
        await CustomRoom.findByIdAndDelete(req.params.id);

        res.json({ message: 'Custom room deleted successfully' });
    } catch (error) {
        console.error('Error deleting custom room:', error);
        res.status(500).json({ error: 'Failed to delete custom room' });
    }
};

// DELETE all custom rooms for demo user (cleanup on logout/leave)
exports.deleteAllDemoCustomRooms = async (req, res) => {
    try {
        // Only allow for demo users
        if (req.user.email !== 'demo@example.com') {
            return res.status(403).json({ error: 'Access denied. This endpoint is only for demo users.' });
        }

        // Delete all custom rooms for this user
        const deleteResult = await CustomRoom.deleteMany({ userId: req.user.userId });

        res.json({
            message: 'All custom rooms deleted successfully',
            deletedCount: deleteResult.deletedCount
        });
    } catch (error) {
        console.error('Error deleting demo custom rooms:', error);
        res.status(500).json({ error: 'Failed to delete custom rooms' });
    }
};
