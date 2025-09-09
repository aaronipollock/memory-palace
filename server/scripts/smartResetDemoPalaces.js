const mongoose = require('mongoose');
const MemoryPalace = require('../models/MemoryPalace');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

const smartResetDemoPalaces = async () => {
    try {
        // Connect to MongoDB (only if not already connected)
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/memory-palace');
        }

        // Find demo user
        const demoUser = await User.findOne({ email: 'demo@example.com' });
        if (!demoUser) {
            console.log('Demo user not found.');
            throw new Error('Demo user not found');
        }

        // Check existing palaces before deletion
        const existingPalaces = await MemoryPalace.find({ userId: demoUser._id });
        console.log(`Found ${existingPalaces.length} existing palaces for demo user`);

        // Delete ALL palaces for demo user
        const deletedCount = await MemoryPalace.deleteMany({
            userId: demoUser._id
        });
        console.log(`Deleted ${deletedCount.deletedCount} demo palaces`);

        // Demo Palace 1: Grocery Shopping List (Throne Room) - 100% Complete
        const groceryAssociations = [
            { anchor: 'throne', memorableItem: 'bread', description: 'A loaf of fresh bread sitting on the throne like a royal crown' },
            { anchor: 'stained glass window', memorableItem: 'milk', description: 'A glass of milk casting a white glow through the stained glass window' },
            { anchor: 'chandelier', memorableItem: 'eggs', description: 'Eggs hanging from the chandelier like crystal ornaments' },
            { anchor: 'red carpet', memorableItem: 'carrots', description: 'Orange carrots scattered along the red carpet path' },
            { anchor: 'banner', memorableItem: 'apples', description: 'Red apples hanging from the royal banner like decorations' },
            { anchor: 'dais', memorableItem: 'cheese', description: 'A wheel of cheese placed on the dais like a royal offering' },
            { anchor: 'column', memorableItem: 'tomatoes', description: 'Ripe red tomatoes growing up the marble column like vines' },
            { anchor: 'footstool', memorableItem: 'bananas', description: 'Yellow bananas arranged on the golden footstool' },
            { anchor: 'candlestick', memorableItem: 'butter', description: 'A stick of butter melting on the ornate candlestick' },
            { anchor: 'statue', memorableItem: 'potatoes', description: 'Potatoes stacked around the base of the marble statue' }
        ];

        // Helper function to extract concrete item from memorableItem (before parentheses)
        const extractConcreteItem = (memorableItem) => {
            const match = memorableItem.match(/^([^(]+)/);
            return match ? match[1].trim() : memorableItem;
        };

        // Create accepted images for all 10 associations (100% complete) - reuse existing images
        const groceryAcceptedImages = {};
        for (const assoc of groceryAssociations) {
            const baseName = `${assoc.anchor.replace(/\s+/g, '-')}-${assoc.memorableItem.replace(/\s+/g, '-')}`;
            const demoImagesDir = path.join(__dirname, '../public/images/demo');

            // Find the most recent image file for this anchor-memorableItem combination
            let imagePath = null;
            if (fs.existsSync(demoImagesDir)) {
                const files = fs.readdirSync(demoImagesDir)
                    .filter(file => file.startsWith(baseName) && file.endsWith('.png'))
                    .sort()
                    .reverse(); // Most recent first

                if (files.length > 0) {
                    imagePath = `/images/demo/${files[0]}`;
                }
            }

            const concreteItem = extractConcreteItem(assoc.memorableItem);
            groceryAcceptedImages[assoc.anchor] = {
                image: imagePath || `/images/demo/${baseName}.png`,
                prompt: `A ${concreteItem} positioned at the ${assoc.anchor} location`,
                association: { anchor: assoc.anchor, memorableItem: assoc.memorableItem },
                timestamp: Date.now()
            };
        }

        const groceryPalace = new MemoryPalace({
            name: 'Grocery Shopping List',
            roomType: 'throne room',
            userId: demoUser._id,
            isSeedData: true,
            associations: groceryAssociations,
            acceptedImages: groceryAcceptedImages,
            completionStatus: {
                totalAnchors: 10,
                acceptedImages: 10,
                isComplete: true,
                progressPercentage: 100
            }
        });

        // Demo Palace 2: American History (Bedchamber) - 70% Complete (7/10)
        const historyAssociations = [
            { anchor: 'bed', memorableItem: 'quill pen writing independence (Declaration of Independence)', description: 'A quill pen writing on a scroll on the bed' },
            { anchor: 'lamp', memorableItem: 'tea cup (Boston Tea Party)', description: 'Tea cup floating in a lamp\'s light' },
            { anchor: 'mirror', memorableItem: 'cherry tree (George Washington)', description: 'A cherry tree reflecting in the mirror' },
            { anchor: 'dresser', memorableItem: 'constitution document (Constitutional Convention)', description: 'A dresser with a large constitution document and quills' },
            { anchor: 'armchair', memorableItem: 'two-dollar bill (Thomas Jefferson)', description: 'An armchair with scattered two-dollar bills' },
            { anchor: 'nightstand', memorableItem: 'ten articles (Bill of Rights)', description: 'A nightstand with ten articles arranged neatly' },
            { anchor: 'wardrobe', memorableItem: 'Revolutionary War uniforms (Revolutionary War)', description: 'A wardrobe filled with colonial military uniforms' },
            { anchor: 'rug', memorableItem: 'Liberty Bell', description: 'A rug with a large bell pattern in the center' },
            { anchor: 'headboard', memorableItem: 'American flag (Stars and Stripes)', description: 'A headboard decorated with the American flag pattern' },
            { anchor: 'ceiling beams', memorableItem: 'wooden framework (Constitutional Framework)', description: 'Ceiling beams forming a strong wooden framework structure' }
        ];

        // Create accepted images for first 7 associations (70% complete) - reuse existing images
        const historyAcceptedImages = {};
        const completedHistoryAnchors = ['bed', 'lamp', 'mirror', 'dresser', 'armchair', 'nightstand', 'wardrobe'];
        for (const anchor of completedHistoryAnchors) {
            const assoc = historyAssociations.find(a => a.anchor === anchor);
            const baseName = `${assoc.anchor.replace(/\s+/g, '-')}-${assoc.memorableItem.replace(/\s+/g, '-')}`;
            const demoImagesDir = path.join(__dirname, '../public/images/demo');

            // Find the most recent image file for this anchor-memorableItem combination
            let imagePath = null;
            if (fs.existsSync(demoImagesDir)) {
                const files = fs.readdirSync(demoImagesDir)
                    .filter(file => file.startsWith(baseName) && file.endsWith('.png'))
                    .sort()
                    .reverse(); // Most recent first

                if (files.length > 0) {
                    imagePath = `/images/demo/${files[0]}`;
                }
            }

            const concreteItem = extractConcreteItem(assoc.memorableItem);
            historyAcceptedImages[anchor] = {
                image: imagePath || `/images/demo/${baseName}.png`,
                prompt: `A ${concreteItem} positioned at the ${assoc.anchor} location`,
                association: { anchor: assoc.anchor, memorableItem: assoc.memorableItem },
                timestamp: Date.now()
            };
        }

        const historyPalace = new MemoryPalace({
            name: 'American History',
            roomType: 'bedchamber',
            userId: demoUser._id,
            isSeedData: true,
            associations: historyAssociations,
            acceptedImages: historyAcceptedImages,
            completionStatus: {
                totalAnchors: 10,
                acceptedImages: 7,
                isComplete: false,
                progressPercentage: 70
            }
        });

        // Demo Palace 3: Human Anatomy (Dungeon) - 30% Complete (3/10)
        const anatomyAssociations = [
            { anchor: 'iron gate', memorableItem: 'Spinal Column', description: 'A gate with vertical bars arranged like vertebrae' },
            { anchor: 'table', memorableItem: 'Heart', description: 'A table with a glowing heart-shaped center' },
            { anchor: 'pillory', memorableItem: 'Rib Cage', description: 'A pillory with bars forming a rib-like pattern' },
            { anchor: 'bookshelf', memorableItem: 'Skin', description: 'A bookshelf with texture like human skin' },
            { anchor: 'wall chains', memorableItem: 'Nervous System', description: 'Chains branching like neural networks' },
            { anchor: 'candelabra', memorableItem: 'Brain', description: 'A candelabra with brain-like folds' },
            { anchor: 'parchment', memorableItem: 'DNA', description: 'Parchment with double helix patterns' },
            { anchor: 'sconce', memorableItem: 'Eyes', description: 'A sconce illuminating like eyes in darkness' },
            { anchor: 'arched ceiling', memorableItem: 'Cell Membrane', description: 'An arched ceiling representing cellular boundaries' },
            { anchor: 'barrel', memorableItem: 'Skeletal System', description: 'A barrel with bone-like patterns' }
        ];

        // Create accepted images for first 3 associations (30% complete) - reuse existing images
        const anatomyAcceptedImages = {};
        const completedAnatomyAnchors = ['iron gate', 'table', 'pillory'];
        for (const anchor of completedAnatomyAnchors) {
            const assoc = anatomyAssociations.find(a => a.anchor === anchor);
            const baseName = `${assoc.anchor.replace(/\s+/g, '-')}-${assoc.memorableItem.replace(/\s+/g, '-')}`;
            const demoImagesDir = path.join(__dirname, '../public/images/demo');

            // Find the most recent image file for this anchor-memorableItem combination
            let imagePath = null;
            if (fs.existsSync(demoImagesDir)) {
                const files = fs.readdirSync(demoImagesDir)
                    .filter(file => file.startsWith(baseName) && file.endsWith('.png'))
                    .sort()
                    .reverse(); // Most recent first

                if (files.length > 0) {
                    imagePath = `/images/demo/${files[0]}`;
                }
            }

            const concreteItem = extractConcreteItem(assoc.memorableItem);
            anatomyAcceptedImages[anchor] = {
                image: imagePath || `/images/demo/${baseName}.png`,
                prompt: `A ${concreteItem} positioned at the ${assoc.anchor} location`,
                association: { anchor: assoc.anchor, memorableItem: assoc.memorableItem },
                timestamp: Date.now()
            };
        }

        const anatomyPalace = new MemoryPalace({
            name: 'Human Anatomy Study',
            roomType: 'dungeon',
            userId: demoUser._id,
            isSeedData: true,
            associations: anatomyAssociations,
            acceptedImages: anatomyAcceptedImages,
            completionStatus: {
                totalAnchors: 10,
                acceptedImages: 3,
                isComplete: false,
                progressPercentage: 30
            }
        });

        // Save all demo palaces
        await groceryPalace.save();
        await historyPalace.save();
        await anatomyPalace.save();

        // Verify the palaces were created correctly
        const finalPalaces = await MemoryPalace.find({ userId: demoUser._id });
        console.log(`Created ${finalPalaces.length} demo palaces:`);
        finalPalaces.forEach(palace => {
            console.log(`- ${palace.name} (${palace.roomType}) - ${palace.completionStatus.progressPercentage}% complete`);
        });

        console.log('✅ Demo palaces reset successfully (smart - reused existing images)');

        // Only exit if this is the main module (standalone script)
        if (require.main === module) {
            process.exit(0);
        }
    } catch (error) {
        console.error('Error resetting demo palaces:', error);
        if (require.main === module) {
            process.exit(1);
        }
        throw error; // Re-throw for calling modules
    }
};

// Export for use in other files
module.exports = { smartResetDemoPalaces };

// Run the script if called directly
if (require.main === module) {
    smartResetDemoPalaces();
}
