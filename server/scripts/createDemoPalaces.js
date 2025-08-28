const mongoose = require('mongoose');
const MemoryPalace = require('../models/MemoryPalace');
const User = require('../models/User');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Stability Diffusion API endpoint
const STABLE_DIFFUSION_API_URL = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';
const API_KEY = process.env.STABILITY_API_KEY;

// Ensure demo images directory exists
const ensureDemoImagesDir = () => {
    const demoImagesDir = path.join(__dirname, '../public/images/demo');
    if (!fs.existsSync(demoImagesDir)) {
        fs.mkdirSync(demoImagesDir, { recursive: true });
    }
    return demoImagesDir;
};

// Function to generate real AI image and save locally
const generateAndSaveAIImage = async (prompt, filename) => {
    try {
        console.log(`Generating AI image for: ${prompt}`);

        const response = await axios({
            method: 'post',
            url: STABLE_DIFFUSION_API_URL,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            data: {
                text_prompts: [
                    {
                        "text": prompt,
                        "weight": 1
                    }
                ],
                cfg_scale: 7,
                height: 1024,
                width: 1024,
                steps: 30,
                samples: 1
            }
        });

        const imageData = response.data.artifacts[0];
        const demoImagesDir = ensureDemoImagesDir();
        const filePath = path.join(demoImagesDir, filename);

        // Save the base64 image data as a file
        const buffer = Buffer.from(imageData.base64, 'base64');
        fs.writeFileSync(filePath, buffer);

        console.log(`Saved AI image: ${filename}`);
        return `/images/demo/${filename}`; // Return the URL path
    } catch (error) {
        console.error('Error generating AI image:', error.message);
        // Fallback to a simple colored square if AI generation fails
        return '/images/demo/fallback.png';
    }
};

// Helper function to create accepted image data with real AI images
const createAcceptedImage = async (anchor, memorableItem, prompt) => {
    const filename = `${anchor.replace(/\s+/g, '-')}-${memorableItem.replace(/\s+/g, '-')}-${Date.now()}.png`;
    const imagePath = await generateAndSaveAIImage(prompt, filename);

    return {
        image: imagePath, // Store the file path instead of base64
        prompt: prompt,
        association: { anchor, memorableItem },
        timestamp: Date.now()
    };
};

const createDemoPalaces = async () => {
    try {
        // Connect to MongoDB (only if not already connected)
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/memory-palace');
            console.log('Connected to MongoDB');
        }

        // Find or create demo user
        let demoUser = await User.findOne({ email: 'demo@example.com' });
        if (!demoUser) {
            console.log('Demo user not found. Please create demo user first.');
            throw new Error('Demo user not found');
        }

        // Clear existing demo palaces
        await MemoryPalace.deleteMany({
            userId: demoUser._id,
            isSeedData: true
        });
        console.log('Cleared existing demo palaces');

        // Demo Palace 1: Grocery Shopping List (Throne Room) - 100% Complete
        const groceryAssociations = [
            {
                anchor: 'throne',
                memorableItem: 'bread',
                description: 'A loaf of fresh bread sitting on the throne like a royal crown'
            },
            {
                anchor: 'stained glass window',
                memorableItem: 'milk',
                description: 'A glass of milk casting a white glow through the stained glass window'
            },
            {
                anchor: 'chandelier',
                memorableItem: 'eggs',
                description: 'Eggs hanging from the chandelier like crystal ornaments'
            },
            {
                anchor: 'red carpet',
                memorableItem: 'carrots',
                description: 'Orange carrots scattered along the red carpet path'
            },
            {
                anchor: 'banner',
                memorableItem: 'apples',
                description: 'Red apples hanging from the royal banner like decorations'
            },
            {
                anchor: 'dais',
                memorableItem: 'cheese',
                description: 'A wheel of cheese placed on the dais like a royal offering'
            },
            {
                anchor: 'column',
                memorableItem: 'tomatoes',
                description: 'Ripe red tomatoes growing up the marble column like vines'
            },
            {
                anchor: 'footstool',
                memorableItem: 'bananas',
                description: 'Yellow bananas arranged on the golden footstool'
            },
            {
                anchor: 'candlestick',
                memorableItem: 'butter',
                description: 'A stick of butter melting on the ornate candlestick'
            },
            {
                anchor: 'statue',
                memorableItem: 'potatoes',
                description: 'Potatoes stacked around the base of the marble statue'
            }
        ];

        // Create accepted images for all 10 associations (100% complete)
        const groceryAcceptedImages = {};
        for (const assoc of groceryAssociations) {
            groceryAcceptedImages[assoc.anchor] = await createAcceptedImage(
                assoc.anchor,
                assoc.memorableItem,
                `A ${assoc.memorableItem} at the ${assoc.anchor} location in a grand throne room`
            );
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

        // Demo Palace 2: American Revolution History (Bedchamber) - 70% Complete (7/10)
        const historyAssociations = [
            {
                anchor: 'bed',
                memorableItem: 'quill pen writing independence (Declaration of Independence)',
                description: 'A quill pen writing on a scroll on the bed'
            },
            {
                anchor: 'lamp',
                memorableItem: 'tea cup (Boston Tea Party)',
                description: 'Tea cup floating in a lamp\'s light'
            },
            {
                anchor: 'mirror',
                memorableItem: 'cherry tree (George Washington)',
                description: 'A cherry tree reflecting in the mirror'
            },
            {
                anchor: 'dresser',
                memorableItem: 'constitution document (Constitutional Convention)',
                description: 'A dresser with a large constitution document and quills'
            },
            {
                anchor: 'armchair',
                memorableItem: 'two-dollar bill (Thomas Jefferson)',
                description: 'An armchair with scattered two-dollar bills'
            },
            {
                anchor: 'nightstand',
                memorableItem: 'ten articles (Bill of Rights)',
                description: 'A nightstand with ten articles arranged neatly'
            },
            {
                anchor: 'wardrobe',
                memorableItem: 'Revolutionary War uniforms (Revolutionary War)',
                description: 'A wardrobe filled with colonial military uniforms'
            },
            {
                anchor: 'rug',
                memorableItem: 'Liberty Bell',
                description: 'A rug with a large bell pattern in the center'
            },
            {
                anchor: 'headboard',
                memorableItem: 'American flag (Stars and Stripes)',
                description: 'A headboard decorated with the American flag pattern'
            },
            {
                anchor: 'ceiling beams',
                memorableItem: 'wooden framework (Constitutional Framework)',
                description: 'Ceiling beams forming a strong wooden framework structure'
            }
        ];

        // Create accepted images for first 7 associations (70% complete)
        const historyAcceptedImages = {};
        const completedHistoryAnchors = ['bed', 'lamp', 'mirror', 'dresser', 'armchair', 'nightstand', 'wardrobe'];
        for (const anchor of completedHistoryAnchors) {
            const assoc = historyAssociations.find(a => a.anchor === anchor);
            historyAcceptedImages[anchor] = await createAcceptedImage(
                assoc.anchor,
                assoc.memorableItem,
                `A ${assoc.memorableItem} at the ${assoc.anchor} location in a cozy bedchamber`
            );
        }

        const historyPalace = new MemoryPalace({
            name: 'American Revolution History',
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
            {
                anchor: 'iron gate',
                memorableItem: 'Spinal Column',
                description: 'A gate with vertical bars arranged like vertebrae'
            },
            {
                anchor: 'table',
                memorableItem: 'Heart',
                description: 'A table with a glowing heart-shaped center'
            },
            {
                anchor: 'pillory',
                memorableItem: 'Rib Cage',
                description: 'A pillory with bars forming a rib-like pattern'
            },
            {
                anchor: 'bookshelf',
                memorableItem: 'Skin',
                description: 'A bookshelf with texture like human skin'
            },
            {
                anchor: 'wall chains',
                memorableItem: 'Nervous System',
                description: 'Chains branching like neural networks'
            },
            {
                anchor: 'candelabra',
                memorableItem: 'Brain',
                description: 'A candelabra with brain-like folds'
            },
            {
                anchor: 'parchment',
                memorableItem: 'DNA',
                description: 'Parchment with double helix patterns'
            },
            {
                anchor: 'sconce',
                memorableItem: 'Eyes',
                description: 'A sconce illuminating like eyes in darkness'
            },
            {
                anchor: 'arched ceiling',
                memorableItem: 'Cell Membrane',
                description: 'An arched ceiling representing cellular boundaries'
            },
            {
                anchor: 'barrel',
                memorableItem: 'Skeletal System',
                description: 'A barrel with bone-like patterns'
            }
        ];

        // Create accepted images for first 3 associations (30% complete)
        const anatomyAcceptedImages = {};
        const completedAnatomyAnchors = ['iron gate', 'table', 'pillory'];
        for (const anchor of completedAnatomyAnchors) {
            const assoc = anatomyAssociations.find(a => a.anchor === anchor);
            anatomyAcceptedImages[anchor] = await createAcceptedImage(
                assoc.anchor,
                assoc.memorableItem,
                `A ${assoc.memorableItem} at the ${assoc.anchor} location in a dark dungeon`
            );
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

        console.log('✅ Demo palaces created successfully:');
        console.log('  - Grocery Shopping List (Throne Room) - 100% Complete');
        console.log('  - American Revolution History (Bedchamber) - 70% Complete');
        console.log('  - Human Anatomy Study (Dungeon) - 30% Complete');

        // Only exit if this is the main module (standalone script)
        if (require.main === module) {
            process.exit(0);
        }
    } catch (error) {
        console.error('Error creating demo palaces:', error);
        if (require.main === module) {
            process.exit(1);
        }
        throw error; // Re-throw for calling modules
    }
};

// Export for use in other files
module.exports = { createDemoPalaces };

// Run the script if called directly
if (require.main === module) {
    createDemoPalaces();
}
