const express = require('express');
const router = express.Router();
const MemoryPalace = require('../models/MemoryPalace');
const { authenticateToken } = require('../middleware/auth');
const { memoryPalaceValidation } = require('../middleware/validation');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Function to save base64 image as file
const saveBase64Image = (base64Data, filename) => {
    try {
        // Ensure user images directory exists
        const userImagesDir = path.join(__dirname, '../public/images/user');
        if (!fs.existsSync(userImagesDir)) {
            fs.mkdirSync(userImagesDir, { recursive: true });
        }

        // Remove data URL prefix if present
        const base64String = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');

        // Save the image
        const filePath = path.join(userImagesDir, filename);
        fs.writeFileSync(filePath, base64String, 'base64');

        return `/images/user/${filename}`;
    } catch (error) {
        console.error('Error saving base64 image:', error);
        return null;
    }
};

// Function to process accepted images and save base64 data as files
const processAcceptedImages = (acceptedImages) => {
    if (!acceptedImages || typeof acceptedImages !== 'object') {
        return acceptedImages;
    }

    const processedImages = {};

    for (const [anchor, imageData] of Object.entries(acceptedImages)) {
        if (imageData && imageData.image) {
            // If it's base64 data, save it as a file
            if (imageData.image.startsWith('data:image')) {
                const filename = `${Date.now()}-${anchor.replace(/\s+/g, '-')}-${imageData.association?.memorableItem?.replace(/\s+/g, '-') || 'item'}.png`;
                const filePath = saveBase64Image(imageData.image, filename);

                if (filePath) {
                    processedImages[anchor] = {
                        ...imageData,
                        image: filePath // Replace base64 with file path
                    };
                } else {
                    // If saving failed, keep the original data
                    processedImages[anchor] = imageData;
                }
            } else {
                // If it's already a file path, keep it as is
                processedImages[anchor] = imageData;
            }
        }
    }

    return processedImages;
};

// Get all memory palaces
router.get('/', async (req, res) => {
    try {
        let palaces;
        if (req.user.email === 'demo@example.com') {
            // Demo user gets access to their own seed data only
            palaces = await MemoryPalace.find({
                userId: req.user.userId,
                isSeedData: true
            }).sort({ createdAt: -1 });
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
        // Process accepted images to save base64 data as files
        const processedAcceptedImages = processAcceptedImages(req.body.acceptedImages);

        const palace = new MemoryPalace({
            ...req.body,
            acceptedImages: processedAcceptedImages,
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

        // Process accepted images to save base64 data as files
        const processedAcceptedImages = processAcceptedImages(req.body.acceptedImages);

        // Update the palace
        const updatedPalace = await MemoryPalace.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                acceptedImages: processedAcceptedImages
            },
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
