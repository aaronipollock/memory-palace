import React, { useState } from 'react';
import InputPage from './components/InputPage';
import RoomVisualizer from './components/RoomVisualizer';

function App() {
    const [isLoading, setIsLoading] = useState(false);
    const [associations, setAssociations] = useState(null);
    const [currentRoomType, setCurrentRoomType] = useState(null);

    const handleImagesGenerated = (images, roomType) => {
        setAssociations(images);
        setCurrentRoomType(roomType);
        setIsLoading(false);
    };

    const handleBack = () => {
        setAssociations(null);
        setCurrentRoomType(null);
    };

    return (
        <main className="min-h-screen bg-background">
            {!associations ? (
                <InputPage
                    onImagesGenerated={handleImagesGenerated}
                    setIsLoading={setIsLoading}
                    isLoading={isLoading}
                />
            ) : (
                <RoomVisualizer
                    associations={associations}
                    roomType={currentRoomType}
                    onBack={handleBack}
                />
            )}
        </main>
    );
}

export default App;
