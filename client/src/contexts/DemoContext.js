import React, { createContext, useContext, useState, useEffect } from 'react';
import { demoStorage } from '../services/demoStorage';

const DemoContext = createContext();

export const DemoProvider = ({ children }) => {
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [preferences, setPreferences] = useState(demoStorage.getPreferences());
    const [palaces, setPalaces] = useState([]);
    const [currentPalace, setCurrentPalace] = useState(null);

    useEffect(() => {
        // Check if we're in demo mode
        const token = localStorage.getItem('token');
        setIsDemoMode(token === 'demo-token');

        if (token === 'demo-token') {
            // Load demo data
            setPalaces(demoStorage.getPalaces());
            setCurrentPalace(demoStorage.getCurrentPalace());
        }
    }, []);

    const savePalace = (palace) => {
        const updatedPalaces = demoStorage.savePalace(palace);
        setPalaces(updatedPalaces);
    };

    const deletePalace = (palaceId) => {
        const updatedPalaces = demoStorage.deletePalace(palaceId);
        setPalaces(updatedPalaces);
    };

    const updatePreferences = (newPreferences) => {
        demoStorage.savePreferences(newPreferences);
        setPreferences(newPreferences);
    };

    const saveAcceptedImage = (anchor, imageData) => {
        return demoStorage.saveAcceptedImage(anchor, imageData);
    };

    const clearDemoData = () => {
        demoStorage.clearAll();
        setPalaces([]);
        setCurrentPalace(null);
        setPreferences(demoStorage.getPreferences());
    };

    const value = {
        isDemoMode,
        preferences,
        palaces,
        currentPalace,
        setCurrentPalace,
        savePalace,
        deletePalace,
        updatePreferences,
        saveAcceptedImage,
        clearDemoData
    };

    return (
        <DemoContext.Provider value={value}>
            {children}
        </DemoContext.Provider>
    );
};

export const useDemo = () => {
    const context = useContext(DemoContext);
    if (!context) {
        throw new Error('useDemo must be used within a DemoProvider');
    }
    return context;
};
