const mongoose = require('mongoose');
const MemoryPalace = require('../models/MemoryPalace');
const User = require('../models/User');

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

        // Demo Palace 1: Spanish Vocabulary (Throne Room)
        const spanishPalace = new MemoryPalace({
            name: 'Spanish Vocabulary Palace',
            roomType: 'throne room',
            userId: demoUser._id,
            isSeedData: true,
            associations: [
                {
                    anchor: 'throne',
                    memorableItem: 'el rey (the king)',
                    description: 'A majestic king sitting on the throne, wearing a crown with Spanish flag colors'
                },
                {
                    anchor: 'stained glass window',
                    memorableItem: 'la ventana (the window)',
                    description: 'A beautiful stained glass window with Spanish architectural patterns'
                },
                {
                    anchor: 'chandelier',
                    memorableItem: 'la luz (the light)',
                    description: 'A glowing chandelier casting warm light throughout the room'
                },
                {
                    anchor: 'red carpet',
                    memorableItem: 'el camino (the path)',
                    description: 'A royal red carpet leading to the throne'
                },
                {
                    anchor: 'banner',
                    memorableItem: 'la bandera (the flag)',
                    description: 'A royal banner waving with Spanish colors'
                },
                {
                    anchor: 'dais',
                    memorableItem: 'el trono (the throne platform)',
                    description: 'A raised dais supporting the royal throne'
                },
                {
                    anchor: 'column',
                    memorableItem: 'la columna (the column)',
                    description: 'A majestic marble column supporting the throne room'
                },
                {
                    anchor: 'footstool',
                    memorableItem: 'el taburete (the footstool)',
                    description: 'A golden footstool at the base of the throne'
                },
                {
                    anchor: 'candlestick',
                    memorableItem: 'la vela (the candle)',
                    description: 'An ornate candlestick illuminating the throne room'
                },
                {
                    anchor: 'statue',
                    memorableItem: 'la estatua (the statue)',
                    description: 'A marble statue of a Spanish nobleman'
                }
            ]
        });

        // Demo Palace 2: American Revolution History (Bedchamber)
        const historyPalace = new MemoryPalace({
            name: 'American Revolution History',
            roomType: 'bedchamber',
            userId: demoUser._id,
            isSeedData: true,
            associations: [
                {
                    anchor: 'bed',
                    memorableItem: 'Declaration of Independence',
                    description: 'A quill pen writing on a scroll on the bed'
                },
                {
                    anchor: 'lamp',
                    memorableItem: 'Boston Tea Party',
                    description: 'Tea leaves floating in a lamp\'s light'
                },
                {
                    anchor: 'mirror',
                    memorableItem: 'George Washington',
                    description: 'A reflection of Washington crossing the Delaware'
                },
                {
                    anchor: 'dresser',
                    memorableItem: 'Constitutional Convention',
                    description: 'A dresser with documents and quills'
                },
                {
                    anchor: 'armchair',
                    memorableItem: 'Thomas Jefferson',
                    description: 'An armchair with drafting papers'
                },
                {
                    anchor: 'nightstand',
                    memorableItem: 'Bill of Rights',
                    description: 'A nightstand with ten scrolls'
                },
                {
                    anchor: 'wardrobe',
                    memorableItem: 'Revolutionary War',
                    description: 'A wardrobe with military uniforms'
                },
                {
                    anchor: 'rug',
                    memorableItem: 'Liberty Bell',
                    description: 'A rug with bell patterns'
                },
                {
                    anchor: 'headboard',
                    memorableItem: 'Stars and Stripes',
                    description: 'A headboard with American flag patterns'
                },
                {
                    anchor: 'ceiling beams',
                    memorableItem: 'Constitutional Framework',
                    description: 'Ceiling beams representing the constitutional structure'
                }
            ]
        });

        // Demo Palace 3: Human Anatomy (Dungeon)
        const anatomyPalace = new MemoryPalace({
            name: 'Human Anatomy Study',
            roomType: 'dungeon',
            userId: demoUser._id,
            isSeedData: true,
            associations: [
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
            ]
        });

        // Save all demo palaces
        await spanishPalace.save();
        await historyPalace.save();
        await anatomyPalace.save();

        console.log('✅ Demo palaces created successfully:');
        console.log('  - Spanish Vocabulary Palace (Throne Room)');
        console.log('  - American Revolution History (Bedchamber)');
        console.log('  - Human Anatomy Study (Dungeon)');

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
