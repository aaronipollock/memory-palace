const express = require('express');
const router = express.Router();
const MemoryPalace = require('../models/MemoryPalace');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all memory palaces
router.get('/', async (req, res) => {
    try {
        let palaces;
        if (req.user.email === 'demo@example.com') {
            // Demo user gets access to all seed data
            palaces = await MemoryPalace.find({ isSeedData: true }).sort({ createdAt: -1 });
        } else {
            // Regular users only get their own palaces
            palaces = await MemoryPalace.find({
                userId: req.user._id,
                isSeedData: { $ne: true } // Exclude seed data
            }).sort({ createdAt: -1 });
        }
        res.json(palaces);
    } catch (error) {
        console.error('Error fetching memory palaces:', error);
        res.status(500).json({ error: 'Failed to fetch memory palaces' });
    }
});

// Get a specific memory palace by ID
router.get('/:id', async (req, res) => {
    try {
        const palace = await MemoryPalace.findById(req.params.id);
        if (!palace) {
            return res.status(404).json({ error: 'Memory palace not found' });
        }

        // Check if user has access to this palace
        if (palace.isSeedData && req.user.email !== 'demo@example.com') {
            return res.status(403).json({ error: 'Access denied' });
        }
        if (!palace.isSeedData && palace.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(palace);
    } catch (error) {
        console.error('Error fetching memory palace:', error);
        res.status(500).json({ error: 'Failed to fetch memory palace' });
    }
});

// Create a new memory palace
router.post('/', async (req, res) => {
    try {
        const palace = new MemoryPalace({
            ...req.body,
            userId: req.user._id,
            isSeedData: false
        });
        await palace.save();
        res.status(201).json(palace);
    } catch (error) {
        console.error('Error creating memory palace:', error);
        res.status(500).json({ error: 'Failed to create memory palace' });
    }
});

module.exports = router;
