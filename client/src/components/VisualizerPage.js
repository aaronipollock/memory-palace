import React, { useState, useEffect } from 'react';
import { ROOM_IMAGES, ROOM_ANCHOR_POSITIONS } from '../constants/roomData';
import ImagePopup from './ImagePopup';
import { generateImage } from '../services/imageService';

const VisualizerPage = ({ associations, roomType }) => {
  const [selectedAssociation, setSelectedAssociation] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0, transform: null });
  const [currentPrompt, setCurrentPrompt] = useState('');

  // Get the current room type from props or localStorage
  const currentRoomType = roomType || localStorage.getItem('roomType') || 'throne room';

  // Get the appropriate room image
  const roomImage = ROOM_IMAGES[currentRoomType] || ROOM_IMAGES["throne room"];

  // Get the appropriate anchor positions for this room
  const anchorPositions = ROOM_ANCHOR_POSITIONS[currentRoomType] || ROOM_ANCHOR_POSITIONS["throne room"];

  const handleClick = async (association, event) => {
    // Calculate popup position based on the clicked button's position
    const rect = event.currentTarget.getBoundingClientRect();

    // Adjust position based on the anchor type and room
    let transformValue = 'translate(-50%, -120%)'; // Default positioning (above)

    // Special positioning for specific anchors in specific rooms
    if (currentRoomType === "throne room") {
      if (association.anchor === 'stained glass window' || association.anchor === 'chandelier') {
        transformValue = 'translate(-50%, 20%)'; // Position below
      } else if (association.anchor === 'throne') {
        transformValue = 'translate(-50%, -130%)'; // Position slightly above
      } else if (association.anchor === 'red carpet') {
        transformValue = 'translate(-50%, -150%)'; // Position higher above
      }
    } else if (currentRoomType === "bedchamber") {
      if (association.anchor === 'lamp' || association.anchor === 'mirror') {
        transformValue = 'translate(-50%, 20%)'; // Position below
      }
    } else if (currentRoomType === "dungeon") {
      if (association.anchor === 'hanging chains' || association.anchor === 'torch') {
        transformValue = 'translate(-50%, 20%)'; // Position below for hanging chains
      }
    }
    // Add more room-specific positioning as needed

    setPopupPosition({
      x: rect.x + window.scrollX,
      y: rect.y + window.scrollY,
      transform: transformValue
    });

    setSelectedAssociation(association);
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setCurrentPrompt('');

    try {
      // Use the imageService to generate the image
      const result = await generateImage(association);

      setGeneratedImage(result.imageUrl);
      setCurrentPrompt(result.prompt);

      // If the result came from cache, we can log that
      if (result.fromCache) {
        console.log('Image loaded from cache');
      }
    } catch (err) {
      console.error('Image generation error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClosePopup = () => {
    setSelectedAssociation(null);
    setGeneratedImage(null);
    setCurrentPrompt('');
  };

  return (
    <div className="mario-bg mario-clouds min-h-screen py-12 px-4">
      <h2 className="mario-header text-2xl mb-8 text-center">YOUR MEMORY CASTLE</h2>

      <div className="relative w-full max-w-6xl mx-auto mario-castle p-4">
        <img
          src={roomImage}
          alt={`${currentRoomType}`}
          className="w-full h-auto rounded-lg"
          style={{ maxHeight: '80vh' }}
        />

        {associations.map((assoc, index) => {
          // Only show buttons for anchor points that exist in the current room
          // AND have a memorable item associated with them
          if (!anchorPositions[assoc.anchor] || !assoc.memorable) return null;

          return (
            <button
              key={index}
              className="absolute cursor-pointer question-block"
              style={{
                ...anchorPositions[assoc.anchor],
                position: 'absolute',
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
                width: '40px',
                height: '40px',
              }}
              onClick={(e) => handleClick(assoc, e)}
            >
            </button>
          );
        })}

        {/* Use the ImagePopup component */}
        {selectedAssociation && (
          <ImagePopup
            association={selectedAssociation}
            position={popupPosition}
            image={generatedImage}
            prompt={currentPrompt}
            isLoading={isLoading}
            error={error}
            onClose={handleClosePopup}
          />
        )}
      </div>
    </div>
  );
};

export default VisualizerPage;
