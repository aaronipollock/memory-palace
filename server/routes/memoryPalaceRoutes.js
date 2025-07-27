const express = require('express');
const router = express.Router();
const MemoryPalace = require('../models/MemoryPalace');
const { authenticateToken } = require('../middleware/auth');
const { memoryPalaceValidation } = require('../middleware/validation');
const mongoose = require('mongoose');

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
                userId: req.user.userId,
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
        if (!palace.isSeedData && palace.userId.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(palace);
    } catch (error) {
        console.error('Error fetching memory palace:', error);
        res.status(500).json({ error: 'Failed to fetch memory palace' });
    }
});

// Create a new memory palace
router.post('/', memoryPalaceValidation.create, async (req, res) => {
    try {
        const palace = new MemoryPalace({
            ...req.body,
            userId: req.user.userId, // Use userId from JWT token
            isSeedData: req.user.email === 'demo@example.com' // Demo users create seed data that gets reset
        });

        await palace.save();
        res.status(201).json(palace);
    } catch (error) {
        console.error('Error creating memory palace:', error);
        res.status(500).json({ error: 'Failed to create memory palace' });
    }
});

// Update a memory palace
router.put('/:id', memoryPalaceValidation.update, async (req, res) => {
    try {
        const palace = await MemoryPalace.findById(req.params.id);
        if (!palace) {
            return res.status(404).json({ error: 'Memory palace not found' });
        }

        // Check if user has access to this palace
        if (palace.isSeedData && req.user.email !== 'demo@example.com') {
            return res.status(403).json({ error: 'Access denied' });
        }
        if (!palace.isSeedData && palace.userId.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Update the palace
        const updatedPalace = await MemoryPalace.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true, runValidators: true }
        );

        res.json(updatedPalace);
    } catch (error) {
        console.error('Error updating memory palace:', error);
        res.status(500).json({ error: 'Failed to update memory palace' });
    }
});

// Delete a memory palace
router.delete('/:id', async (req, res) => {
    try {
        const palace = await MemoryPalace.findById(req.params.id);
        if (!palace) {
            return res.status(404).json({ error: 'Memory palace not found' });
        }

        // Check if user has access to this palace
        if (palace.isSeedData && req.user.email !== 'demo@example.com') {
            return res.status(403).json({ error: 'Access denied' });
        }
        if (!palace.isSeedData && palace.userId.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Delete the palace
        await MemoryPalace.findByIdAndDelete(req.params.id);

        res.json({ message: 'Memory palace deleted successfully' });
    } catch (error) {
        console.error('Error deleting memory palace:', error);
        res.status(500).json({ error: 'Failed to delete memory palace' });
    }
});

module.exports = router;
