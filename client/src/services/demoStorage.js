// Demo storage service for handling demo mode data persistence
const DEMO_STORAGE_KEYS = {
    PALACES: 'demo_palaces',
    CURRENT_PALACE: 'demo_current_palace',
    ACCEPTED_IMAGES: 'demo_accepted_images',
    USER_PREFERENCES: 'demo_preferences'
};

export const demoStorage = {
    // Palace management
    getPalaces: () => {
        const palaces = localStorage.getItem(DEMO_STORAGE_KEYS.PALACES);
        return palaces ? JSON.parse(palaces) : [];
    },

    savePalace: (palace) => {
        const palaces = demoStorage.getPalaces();
        const updatedPalaces = [...palaces, { ...palace, id: Date.now() }];
        localStorage.setItem(DEMO_STORAGE_KEYS.PALACES, JSON.stringify(updatedPalaces));
        return updatedPalaces;
    },

    deletePalace: (palaceId) => {
        const palaces = demoStorage.getPalaces();
        const updatedPalaces = palaces.filter(p => p.id !== palaceId);
        localStorage.setItem(DEMO_STORAGE_KEYS.PALACES, JSON.stringify(updatedPalaces));
        return updatedPalaces;
    },

    // Current palace management
    getCurrentPalace: () => {
        const palace = localStorage.getItem(DEMO_STORAGE_KEYS.CURRENT_PALACE);
        return palace ? JSON.parse(palace) : null;
    },

    setCurrentPalace: (palace) => {
        localStorage.setItem(DEMO_STORAGE_KEYS.CURRENT_PALACE, JSON.stringify(palace));
    },

    // Accepted images management
    getAcceptedImages: () => {
        const images = localStorage.getItem(DEMO_STORAGE_KEYS.ACCEPTED_IMAGES);
        return images ? JSON.parse(images) : {};
    },

    saveAcceptedImage: (anchor, imageData) => {
        const images = demoStorage.getAcceptedImages();
        const updatedImages = { ...images, [anchor]: imageData };
        localStorage.setItem(DEMO_STORAGE_KEYS.ACCEPTED_IMAGES, JSON.stringify(updatedImages));
        return updatedImages;
    },

    // User preferences
    getPreferences: () => {
        const prefs = localStorage.getItem(DEMO_STORAGE_KEYS.USER_PREFERENCES);
        return prefs ? JSON.parse(prefs) : {
            roomType: 'throne room',
            artStyle: 'realistic',
            showTutorial: true
        };
    },

    savePreferences: (preferences) => {
        localStorage.setItem(DEMO_STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    },

    // Clear all demo data
    clearAll: () => {
        Object.values(DEMO_STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    }
};
