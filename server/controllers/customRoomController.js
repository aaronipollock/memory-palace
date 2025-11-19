const CustomRoom = require('../models/CustomRoom');

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
        if (!name || !imageUrl) {
            return res.status(400).json({
                error: 'Name and imageUrl are required'
            });
        }

        // Create new custom room
        const customRoom = new CustomRoom({
            name,
            description: description || '', // Optional field
            imageUrl,
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
        const customRoom = await CustomRoom.findById(req.params.id);

        // Check if room exists
        if (!customRoom) {
            return res.status(404).json({ error: 'Custom room not found' });
        }

        // Check if user owns this room
        if (customRoom.userId.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Update fields (only update what's provided)
        if (req.body.name !== undefined) customRoom.name = req.body.name;
        if (req.body.description !== undefined) customRoom.description = req.body.description;
        if (req.body.imageUrl !== undefined) customRoom.imageUrl = req.body.imageUrl;

        // Handle anchor points - can add new ones or replace all
        if (req.body.anchorPoints !== undefined) {
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
