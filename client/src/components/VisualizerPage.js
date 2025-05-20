import React, { useState, useEffect } from 'react';
import { ROOM_IMAGES, ROOM_ANCHOR_POSITIONS } from '../constants/roomData';
import ImagePopup from './ImagePopup';
import SaveRoomModal from './SaveRoomModal';
import { generateImage } from '../services/imageService';
import NavBar from './NavBar';

const VisualizerPage = () => {
  const [selectedAssociation, setSelectedAssociation] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0, transform: null });
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [acceptedImages, setAcceptedImages] = useState(() => {
    const saved = localStorage.getItem('acceptedImages');
    return saved ? JSON.parse(saved) : {};
  });
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [savedRooms, setSavedRooms] = useState(() => {
    const saved = localStorage.getItem('savedRooms');
    return saved ? JSON.parse(saved) : [];
  });

  // Get the current palace data from localStorage
  const currentPalace = JSON.parse(localStorage.getItem('currentPalace') || '{}');
  const { roomType = 'throne room', associations = [] } = currentPalace;

  // Save accepted images to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('acceptedImages', JSON.stringify(acceptedImages));
  }, [acceptedImages]);

  // Save rooms to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('savedRooms', JSON.stringify(savedRooms));
  }, [savedRooms]);

  // Get the appropriate room image
  const roomImage = ROOM_IMAGES[roomType] || ROOM_IMAGES["throne room"];

  // Get the appropriate anchor positions for this room
  const anchorPositions = ROOM_ANCHOR_POSITIONS[roomType] || ROOM_ANCHOR_POSITIONS["throne room"];

  // Check if all images have been accepted
  const allImagesAccepted = associations.every(assoc =>
    acceptedImages[assoc.anchor] && acceptedImages[assoc.anchor].image
  );

  const handleSaveRoom = (roomData) => {
    setSavedRooms(prev => [...prev, roomData]);
    setIsSaveModalOpen(false);
  };

  const handleClick = async (association, event) => {
    // Calculate popup position based on the clicked button's position
    const rect = event.currentTarget.getBoundingClientRect();

    // Adjust position based on the anchor type and room
    let transformValue = 'translate(-50%, -120%)'; // Default positioning (above)

    // Special positioning for specific anchors in specific rooms
    if (roomType === "throne room") {
      if (association.anchor === 'stained glass window' || association.anchor === 'chandelier') {
        transformValue = 'translate(-50%, 20%)'; // Position below
      } else if (association.anchor === 'throne') {
        transformValue = 'translate(-50%, -130%)'; // Position slightly above
      } else if (association.anchor === 'red carpet') {
        transformValue = 'translate(-50%, -150%)'; // Position higher above
      }
    } else if (roomType === "bedchamber") {
      if (association.anchor === 'lamp' || association.anchor === 'mirror') {
        transformValue = 'translate(-50%, 20%)'; // Position below
      }
    } else if (roomType === "dungeon") {
      if (association.anchor === 'hanging chains' || association.anchor === 'torch') {
        transformValue = 'translate(-50%, 20%)'; // Position below for hanging chains
      }
    }

    setPopupPosition({
      x: rect.x + window.scrollX,
      y: rect.y + window.scrollY,
      transform: transformValue
    });

    // Ensure association has the correct structure
    const processedAssociation = {
      anchor: association.anchor,
      memorable: association.memorableItem, // Map memorableItem to memorable for the image service
      description: association.description
    };

    setSelectedAssociation(processedAssociation);
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setCurrentPrompt('');

    try {
      // Check if we have an accepted image for this anchor
      if (acceptedImages[association.anchor]) {
        setGeneratedImage(acceptedImages[association.anchor].image);
        setCurrentPrompt(acceptedImages[association.anchor].prompt);
      } else {
        // Generate new image if no accepted image exists
        const result = await generateImage(processedAssociation, setCurrentPrompt);
        setGeneratedImage(result.imageUrl);
        setCurrentPrompt(result.prompt);
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

  const handleAcceptImage = () => {
    if (selectedAssociation && generatedImage) {
      setAcceptedImages(prev => ({
        ...prev,
        [selectedAssociation.anchor]: {
          image: generatedImage,
          prompt: currentPrompt,
          association: selectedAssociation
        }
      }));
      handleClosePopup();
    }
  };

  const handleRejectImage = async () => {
    if (selectedAssociation) {
      setIsLoading(true);
      setError(null);
      setGeneratedImage(null);
      setCurrentPrompt('');

      try {
        const result = await generateImage(selectedAssociation, setCurrentPrompt);
        setGeneratedImage(result.imageUrl);
        setCurrentPrompt(result.prompt);
      } catch (err) {
        console.error('Image generation error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="mario-bg mario-clouds py-12 px-4">
        <h2 className="mario-header text-2xl mb-8 text-center">YOUR MEMORY CASTLE</h2>

        <div className="relative w-full max-w-6xl mx-auto mario-castle p-4">
          <img
            src={roomImage}
            alt={`${roomType}`}
            className="w-full h-auto rounded-lg"
            style={{ maxHeight: '80vh' }}
          />

          {associations.map((assoc, index) => {
            // Only show buttons for anchor points that exist in the current room
            // AND have a memorable item associated with them
            if (!anchorPositions[assoc.anchor] || !assoc.memorableItem) return null;

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

          {/* Save Room Button */}
          {allImagesAccepted && (
            <button
              onClick={() => setIsSaveModalOpen(true)}
              className="fixed bottom-8 right-8 bg-primary text-white px-6 py-3 rounded-lg shadow-lg hover:bg-primary-dark transition-colors duration-200 z-20"
            >
              Save Room
            </button>
          )}

          {/* Image Popup */}
          {selectedAssociation && (
            <ImagePopup
              association={selectedAssociation}
              position={popupPosition}
              image={generatedImage}
              prompt={currentPrompt}
              isLoading={isLoading}
              error={error}
              onClose={handleClosePopup}
              onAccept={handleAcceptImage}
              onReject={handleRejectImage}
            />
          )}

          {/* Save Room Modal */}
          <SaveRoomModal
            isOpen={isSaveModalOpen}
            onClose={() => setIsSaveModalOpen(false)}
            onSave={handleSaveRoom}
            acceptedImages={acceptedImages}
            roomType={roomType}
          />
        </div>
      </div>
    </div>
  );
};

export default VisualizerPage;
