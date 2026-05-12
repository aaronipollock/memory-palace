const mongoose = require('mongoose');
const MemoryPalace = require('../models/MemoryPalace');
const User = require('../models/User');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { enhancePrompt } = require('../services/promptEnhancerService');

const STABLE_DIFFUSION_API_URL = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';
const API_KEY = process.env.STABILITY_API_KEY;

const ensureDemoImagesDir = () => {
    const demoImagesDir = path.join(__dirname, '../public/images/demo');
    if (!fs.existsSync(demoImagesDir)) {
        fs.mkdirSync(demoImagesDir, { recursive: true });
    }
    return demoImagesDir;
};

const generateAndSaveAIImage = async (prompt, negativePrompt, filename) => {
    try {
        console.log(`Generating AI image for: ${prompt.slice(0, 80)}...`);
        const textPrompts = [{ text: prompt, weight: 1 }];
        if (negativePrompt) {
            textPrompts.push({ text: negativePrompt, weight: -1 });
        }
        const response = await axios({
            method: 'post',
            url: STABLE_DIFFUSION_API_URL,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            data: {
                text_prompts: textPrompts,
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
        fs.writeFileSync(filePath, Buffer.from(imageData.base64, 'base64'));
        console.log(`Saved AI image: ${filename}`);
        return `/images/demo/${filename}`;
    } catch (error) {
        console.error('Error generating AI image:', error.message);
        return '/images/demo/fallback.png';
    }
};

const createAcceptedImage = async (anchor, memorableItem, roomType, artStyle = 'Random', mode = 'normal') => {
    const contract = await enhancePrompt({ anchor, memorableItem, artStyle, roomType, room_context: '', mode });
    const filename = `${anchor.replace(/\s+/g, '-')}-${memorableItem.replace(/\s+/g, '-')}-${Date.now()}.png`;
    const imagePath = await generateAndSaveAIImage(contract.prompt, contract.negative_prompt, filename);
    return {
        image: imagePath,
        prompt: contract.prompt,
        rationale: contract.rationale || '',
        association: { anchor, memorableItem },
        timestamp: Date.now()
    };
};

const createDemoPalaces = async () => {
    try {
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/memory-palace');
            console.log('Connected to MongoDB');
        }

        let demoUser = await User.findOne({ email: 'demo@example.com' });
        if (!demoUser) {
            throw new Error('Demo user not found. Please create demo user first.');
        }

        await MemoryPalace.deleteMany({ userId: demoUser._id, isSeedData: true });
        console.log('Cleared existing demo palaces');

        // Demo Palace 1: Review of Systems (Throne Room) — 100% complete
        const rosAssociations = [
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

        const rosAcceptedImages = {};
        for (const assoc of rosAssociations) {
            rosAcceptedImages[assoc.anchor] = await createAcceptedImage(
                assoc.anchor, assoc.memorableItem, 'throne room'
            );
        }

        const rosPalace = new MemoryPalace({
            name: 'Review of Systems',
            roomType: 'throne room',
            userId: demoUser._id,
            isSeedData: true,
            associations: rosAssociations,
            acceptedImages: rosAcceptedImages,
            completionStatus: {
                totalAnchors: 10,
                acceptedImages: 10,
                isComplete: true,
                progressPercentage: 100
            }
        });

        // Demo Palace 2: Gettysburg Address (Bedchamber) — 70% complete
        const gettysburgAssociations = [
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

        const gettysburgAcceptedImages = {};
        const gettysburgCompleted = ['bed', 'lamp', 'mirror', 'dresser', 'armchair', 'nightstand', 'wardrobe'];
        for (const assoc of gettysburgAssociations) {
            if (gettysburgCompleted.includes(assoc.anchor)) {
                gettysburgAcceptedImages[assoc.anchor] = await createAcceptedImage(
                    assoc.anchor, assoc.memorableItem, 'bedchamber'
                );
            }
        }

        const gettysburgPalace = new MemoryPalace({
            name: 'Gettysburg Address',
            roomType: 'bedchamber',
            userId: demoUser._id,
            isSeedData: true,
            associations: gettysburgAssociations,
            acceptedImages: gettysburgAcceptedImages,
            completionStatus: {
                totalAnchors: 10,
                acceptedImages: 7,
                isComplete: false,
                progressPercentage: 70
            }
        });

        // Demo Palace 3: Ten Plagues of Egypt (Dungeon) — 30% complete
        const plaguesAssociations = [
            { anchor: 'iron gate',     memorableItem: 'blood' },
            { anchor: 'table',         memorableItem: 'frogs' },
            { anchor: 'pillory',       memorableItem: 'lice' },
            { anchor: 'bookshelf',     memorableItem: 'flies' },
            { anchor: 'wall chains',   memorableItem: 'livestock disease' },
            { anchor: 'candelabra',    memorableItem: 'boils' },
            { anchor: 'parchment',     memorableItem: 'hail' },
            { anchor: 'sconce',        memorableItem: 'locusts' },
            { anchor: 'arched ceiling',memorableItem: 'darkness' },
            { anchor: 'barrel',        memorableItem: 'death of the firstborn' }
        ];

        const plaguesAcceptedImages = {};
        const plaguesCompleted = ['iron gate', 'table', 'pillory'];
        for (const assoc of plaguesAssociations) {
            if (plaguesCompleted.includes(assoc.anchor)) {
                plaguesAcceptedImages[assoc.anchor] = await createAcceptedImage(
                    assoc.anchor, assoc.memorableItem, 'dungeon'
                );
            }
        }

        const plaguesPalace = new MemoryPalace({
            name: 'Ten Plagues of Egypt',
            roomType: 'dungeon',
            userId: demoUser._id,
            isSeedData: true,
            associations: plaguesAssociations,
            acceptedImages: plaguesAcceptedImages,
            completionStatus: {
                totalAnchors: 10,
                acceptedImages: 3,
                isComplete: false,
                progressPercentage: 30
            }
        });

        await rosPalace.save();
        await gettysburgPalace.save();
        await plaguesPalace.save();

        console.log('✅ Demo palaces created successfully:');
        console.log('  - Review of Systems (Throne Room) — 100% complete');
        console.log('  - Gettysburg Address (Bedchamber) — 70% complete');
        console.log('  - Ten Plagues of Egypt (Dungeon) — 30% complete');

        if (require.main === module) {
            process.exit(0);
        }
    } catch (error) {
        console.error('Error creating demo palaces:', error);
        if (require.main === module) {
            process.exit(1);
        }
        throw error;
    }
};

module.exports = { createDemoPalaces };

if (require.main === module) {
    createDemoPalaces();
}
