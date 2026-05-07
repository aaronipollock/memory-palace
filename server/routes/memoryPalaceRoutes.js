const express = require('express');
const router = express.Router();
const MemoryPalace = require('../models/MemoryPalace');
const { authenticateToken } = require('../middleware/auth');
const { memoryPalaceValidation } = require('../middleware/validation');
const fs = require('fs');
const path = require('path');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

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
                    console.error(`Failed to save image for ${anchor}`);
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
router.get('/', asyncHandler(async (req, res) => {
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
}));

// Get a specific memory palace by ID
// This route will trigger a CastError if an invalid ObjectId is provided (e.g., "invalid123")
router.get('/:id', asyncHandler(async (req, res) => {
    const palace = await MemoryPalace.findById(req.params.id);

    if (!palace) {
        throw new AppError('Memory palace not found', 404);
    }

    // Check if user has access to this palace
    if (palace.isSeedData && req.user.email !== 'demo@example.com') {
        throw new AppError('Access denied', 403);
    }
    if (!palace.isSeedData && palace.userId.toString() !== req.user.userId) {
        throw new AppError('Access denied', 403);
    }

    res.json(palace);
}));

// Create a new memory palace
router.post('/', memoryPalaceValidation.create, asyncHandler(async (req, res) => {
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
}));

// Update a memory palace
router.put('/:id', memoryPalaceValidation.update, asyncHandler(async (req, res) => {
    const palace = await MemoryPalace.findById(req.params.id);
    if (!palace) {
        throw new AppError('Memory palace not found', 404);
    }

    // Check if user has access to this palace
    if (palace.isSeedData && req.user.email !== 'demo@example.com') {
        throw new AppError('Access denied', 403);
    }
    if (!palace.isSeedData && palace.userId.toString() !== req.user.userId) {
        throw new AppError('Access denied', 403);
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
}));

// Delete a memory palace
router.delete('/:id', asyncHandler(async (req, res) => {
    const palace = await MemoryPalace.findById(req.params.id);
    if (!palace) {
        throw new AppError('Memory palace not found', 404);
    }

    // Check if user has access to this palace
    if (palace.isSeedData && req.user.email !== 'demo@example.com') {
        throw new AppError('Access denied', 403);
    }
    if (!palace.isSeedData && palace.userId.toString() !== req.user.userId) {
        throw new AppError('Access denied', 403);
    }

    // Delete the palace
    await MemoryPalace.findByIdAndDelete(req.params.id);

    res.json({ message: 'Memory palace deleted successfully' });
}));

module.exports = router;
