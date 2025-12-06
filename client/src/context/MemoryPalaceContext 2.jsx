import { createContext, useContext, useState } from 'react';

const MemoryPalaceContext = createContext();

export const MemoryPalaceProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const value = {
        items,
        setItems,
        images,
        setImages,
        isLoading,
        setIsLoading,
        error,
        setError
    };

    return (
        <MemoryPalaceContext.Provider value={value}>
            {children}
        </MemoryPalaceContext.Provider>
    );
};

export const useMemoryPalace = () => {
    const context = useContext(MemoryPalaceContext);
    if (context === undefined) {
        throw new Error('useMemoryPalace must be used within a MemoryPalaceProvider');
    }
    return context;
}
