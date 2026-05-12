const mongoose = require('mongoose');
const MemoryPalace = require('../models/MemoryPalace');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Reuse the most recent generated image for a given anchor+memorableItem pair.
const findDemoImage = (anchor, memorableItem) => {
    const baseName = `${anchor.replace(/\s+/g, '-')}-${memorableItem.replace(/\s+/g, '-')}`;
    const demoImagesDir = path.join(__dirname, '../public/images/demo');
    if (!fs.existsSync(demoImagesDir)) return null;
    const files = fs.readdirSync(demoImagesDir)
        .filter(f => f.startsWith(baseName) && f.endsWith('.png'))
        .sort()
        .reverse();
    return files.length > 0 ? `/images/demo/${files[0]}` : null;
};

// ─── Demo data ────────────────────────────────────────────────────────────────

const ROS_ASSOCIATIONS = [
    { anchor: 'throne',               memorableItem: 'fever' },
    { anchor: 'stained glass window', memorableItem: 'fatigue' },
    { anchor: 'chandelier',           memorableItem: 'weight loss' },
    { anchor: 'red carpet',           memorableItem: 'cough' },
    { anchor: 'tapestry',             memorableItem: 'shortness of breath' },
    { anchor: 'dais',                 memorableItem: 'chest pain' },
    { anchor: 'column',               memorableItem: 'nausea' },
    { anchor: 'footstool',            memorableItem: 'headache' },
    { anchor: 'candlestick',          memorableItem: 'dizziness' },
    { anchor: 'statue',               memorableItem: 'rash' }
];

const ROS_RATIONALE = {
    'throne':               'The throne itself is burning hot — glowing cracks, heat waves, a spiking thermometer — so the seat screams fever the moment you see it.',
    'stained glass window': 'Fatigue splits into fat + fatigues: a fat pig in camo fatigues slumped on the stained glass window locks in both the word and the spot.',
    'chandelier':           'Weight loss is literal: the chandelier is shedding actual weights (dumbbells), so the image directly spells out the concept — weights falling off equals weight loss.',
    'red carpet':           "Cough sounds like 'coff' — close to 'coffee' — so a coffee cup drenching the red carpet snaps the word back.",
    'tapestry':             'The tapestry is being squished SHORT and air puffs are BREATHED out of it — short + breath = shortness of breath.',
    'dais':                 'Chest pain → a treasure chest visibly hurting: the chest on the dais is the cue, and its pained expression locks in the phrase.',
    'column':               "Nausea sounds like 'naw-sea': the column is visibly sick and heaving with green sea-like waves — see the column nauseated and you've got the word.",
    'footstool':            'Headache splits into head + ache: a giant aching head is literally resting on the footstool, so you see the head and feel the ache.',
    'candlestick':          'The candlestick is spinning with spiral motion lines — the classic cartoon sign of dizziness — so the image directly shows the feeling.',
    'statue':               'The statue is covered in a rash and scratching itself — the itchy red patches on stone directly cue the word rash.'
};

const GETTYSBURG_ASSOCIATIONS = [
    { anchor: 'bed',           memorableItem: 'fourscore' },
    { anchor: 'lamp',          memorableItem: 'forefathers' },
    { anchor: 'mirror',        memorableItem: 'liberty' },
    { anchor: 'dresser',       memorableItem: 'equal' },
    { anchor: 'armchair',      memorableItem: 'battlefield' },
    { anchor: 'nightstand',    memorableItem: 'dedicate' },
    { anchor: 'wardrobe',      memorableItem: 'consecrate' },
    { anchor: 'rug',           memorableItem: 'remember' },
    { anchor: 'headboard',     memorableItem: 'unfinished' },
    { anchor: 'ceiling beams', memorableItem: 'people' }
];

const GETTYSBURG_RATIONALE = {
    'bed':       "Fourscore splits into four + score: four scoreboards smashing the bed so you read 'four' (the count) and 'score' (the boards) at a glance.",
    'lamp':      'Forefathers → four fathers: four old father-figures lifting the lamp together, so you count four dads and land on forefathers.',
    'mirror':    'Liberty → Liberty Bell: the mirror is actively crushing the iconic bell, so the moment you picture the mirror you see the Liberty Bell and recall liberty.',
    'dresser':   'Equal → the dresser is literally balanced on an equals sign, so the shape of the symbol directly cues the word.',
    'armchair':  'Battlefield splits into battle + field: the armchair is literally rolling through a battle on an open field, so the word writes itself.',
    'nightstand':"Dedicate → ded + i + cate: a gate being crashed through by a cake on the nightstand — gate cues the ending, cake cues the middle, and the whole crash is hard to forget.",
    'wardrobe':  'Consecrate → cone + sacred crate: a holy cone is literally crating the wardrobe, so you see cone + crate and hear con-se-crate.'
};

const PLAGUES_ASSOCIATIONS = [
    { anchor: 'iron gate',      memorableItem: 'blood' },
    { anchor: 'table',          memorableItem: 'frogs' },
    { anchor: 'pillory',        memorableItem: 'lice' },
    { anchor: 'bookshelf',      memorableItem: 'flies' },
    { anchor: 'wall chains',    memorableItem: 'livestock disease' },
    { anchor: 'candelabra',     memorableItem: 'boils' },
    { anchor: 'parchment',      memorableItem: 'hail' },
    { anchor: 'sconce',         memorableItem: 'locusts' },
    { anchor: 'arched ceiling', memorableItem: 'darkness' },
    { anchor: 'barrel',         memorableItem: 'death of the firstborn' }
];

const PLAGUES_RATIONALE = {
    'iron gate': 'Blood is a concrete noun, so the image shows it directly: a red flood smashing the iron gate open so the gate and blood are locked in one unmistakable action.',
    'table':     'Frogs are literally jumping off the table — the leaping frogs make the table impossible to forget.',
    'pillory':   'A giant louse is literally attacking the pillory, so the bug and the wooden stocks are burned together in your memory.'
};

// ─── Reset logic ──────────────────────────────────────────────────────────────

const buildAcceptedImages = (associations, completedAnchors, rationaleMap) => {
    const acceptedImages = {};
    for (const assoc of associations) {
        if (!completedAnchors.includes(assoc.anchor)) continue;
        const imagePath = findDemoImage(assoc.anchor, assoc.memorableItem);
        acceptedImages[assoc.anchor] = {
            image: imagePath || `/images/demo/${assoc.anchor.replace(/\s+/g, '-')}-${assoc.memorableItem.replace(/\s+/g, '-')}.png`,
            prompt: `${assoc.memorableItem} interacting with a ${assoc.anchor}.`,
            rationale: rationaleMap[assoc.anchor] || '',
            association: { anchor: assoc.anchor, memorableItem: assoc.memorableItem },
            timestamp: Date.now()
        };
    }
    return acceptedImages;
};

const smartResetDemoPalaces = async () => {
    try {
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/memory-palace');
        }

        const demoUser = await User.findOne({ email: 'demo@example.com' });
        if (!demoUser) throw new Error('Demo user not found');

        const existing = await MemoryPalace.find({ userId: demoUser._id });
        console.log(`Found ${existing.length} existing palaces for demo user`);

        await MemoryPalace.deleteMany({ userId: demoUser._id });
        console.log('Deleted existing demo palaces');

        const rosCompleted = ROS_ASSOCIATIONS.map(a => a.anchor);
        const rosPalace = new MemoryPalace({
            name: 'Review of Systems',
            roomType: 'throne room',
            userId: demoUser._id,
            isSeedData: true,
            associations: ROS_ASSOCIATIONS,
            acceptedImages: buildAcceptedImages(ROS_ASSOCIATIONS, rosCompleted, ROS_RATIONALE),
            completionStatus: { totalAnchors: 10, acceptedImages: 10, isComplete: true, progressPercentage: 100 }
        });

        const gettysburgCompleted = ['bed', 'lamp', 'mirror', 'dresser', 'armchair', 'nightstand', 'wardrobe'];
        const gettysburgPalace = new MemoryPalace({
            name: 'Gettysburg Address',
            roomType: 'bedchamber',
            userId: demoUser._id,
            isSeedData: true,
            associations: GETTYSBURG_ASSOCIATIONS,
            acceptedImages: buildAcceptedImages(GETTYSBURG_ASSOCIATIONS, gettysburgCompleted, GETTYSBURG_RATIONALE),
            completionStatus: { totalAnchors: 10, acceptedImages: 7, isComplete: false, progressPercentage: 70 }
        });

        const plaguesCompleted = ['iron gate', 'table', 'pillory'];
        const plaguesPalace = new MemoryPalace({
            name: 'Ten Plagues of Egypt',
            roomType: 'dungeon',
            userId: demoUser._id,
            isSeedData: true,
            associations: PLAGUES_ASSOCIATIONS,
            acceptedImages: buildAcceptedImages(PLAGUES_ASSOCIATIONS, plaguesCompleted, PLAGUES_RATIONALE),
            completionStatus: { totalAnchors: 10, acceptedImages: 3, isComplete: false, progressPercentage: 30 }
        });

        await rosPalace.save();
        await gettysburgPalace.save();
        await plaguesPalace.save();

        const final = await MemoryPalace.find({ userId: demoUser._id });
        console.log(`Created ${final.length} demo palaces:`);
        final.forEach(p => console.log(`  - ${p.name} (${p.roomType}) — ${p.completionStatus.progressPercentage}% complete`));
        console.log('✅ Demo palaces reset successfully');

        if (require.main === module) process.exit(0);
    } catch (error) {
        console.error('Error resetting demo palaces:', error);
        if (require.main === module) process.exit(1);
        throw error;
    }
};

module.exports = { smartResetDemoPalaces };

if (require.main === module) {
    smartResetDemoPalaces();
}
