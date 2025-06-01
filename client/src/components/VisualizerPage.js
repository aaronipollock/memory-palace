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

  // Check if all images have been accepted (only for visible associations)
  const visibleAssociations = associations.filter(
    assoc => anchorPositions[assoc.anchor] && assoc.memorableItem
  );
  const allImagesAccepted = visibleAssociations.every(assoc =>
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
      if (association.anchor === 'stained glass window') {
        transformValue = 'translate(-50%, -60%)'; // Stained glass window popup
      } else if (association.anchor === 'chandelier') {
        transformValue = 'translate(-50%, -30%)'; // Chandelier popup a bit lower
      } else if (association.anchor === 'statue') {
        transformValue = 'translate(-50%, -80%)'; // Statue popup a bit lower
      } else if (association.anchor === 'throne') {
        transformValue = 'translate(-50%, -100%)'; // Throne popup a bit down
      } else if (association.anchor === 'red carpet') {
        transformValue = 'translate(-50%, -100%)'; // Position higher above
      }
    } else if (roomType === "bedchamber") {
      if (association.anchor === 'lamp' || association.anchor === 'mirror') {
        transformValue = 'translate(-50%, 20%)'; // Position below
      }
    } else if (roomType === "dungeon") {
      if (association.anchor === 'hanging chains' || association.anchor === 'sconce') {
        transformValue = 'translate(-50%, 20%)'; // Position below for hanging chains
      }
    }

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
      // Check if we have an accepted image for this anchor
      if (acceptedImages[association.anchor]) {
        setGeneratedImage(acceptedImages[association.anchor].image);
        setCurrentPrompt(acceptedImages[association.anchor].prompt);
      } else {
        // Generate new image if no accepted image exists
        const result = await generateImage(association, setCurrentPrompt);
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
      <div className="loci-bg py-12 px-4">
        <div className="flex flex-col md:flex-row gap-8 items-start max-w-6xl mx-auto">
          {/* Directions on the left */}
          <div className="w-full md:w-1/3 mb-8 md:mb-0 bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-primary">How to Use Your Memory Palace</h3>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong>Study the Room:</strong> Take a moment to notice the anchor points (highlighted areas) and their positions in the room. This spatial awareness will help strengthen your memory associations.
              </li>
              <li>
                <strong>Click on Anchor Points:</strong> Click on any highlighted area in the room to generate an image for that location.
              </li>
              <li>
                <strong>Review Generated Images:</strong> Each click will generate a unique image representing your memorable item at that location.
              </li>
              <li>
                <strong>Accept or Reject:</strong> If you like the image, click "Accept". If not, click "Reject" to generate a new one.
              </li>
              <li>
                <strong>Complete All Points:</strong> Continue until you've accepted images for all anchor points in the room.
              </li>
              <li>
                <strong>Save Your Palace:</strong> Once all images are accepted, click "Save Room" to name and save your memory palace.
              </li>
            </ol>
          </div>

          {/* Image and anchors on the right */}
          <div className="relative w-full md:w-2/3 max-w-4xl loci-container p-4">
            <img
              src={roomImage}
              alt={`${roomType}`}
              className="w-full h-auto rounded-lg aspect-[1/1]"
              style={{ maxHeight: '95vh' }}
            />

            {associations.map((assoc, index) => {
              if (!anchorPositions[assoc.anchor] || !assoc.memorableItem) return null;

              return (
                <button
                  key={index}
                  className="absolute cursor-pointer loci-anchor"
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
                  <div className="w-full h-full flex items-center justify-center text-white/40 hover:text-white/60 transition-colors duration-200 text-xl font-bold">
                    {acceptedImages[assoc.anchor] && acceptedImages[assoc.anchor].image ? '✓' : '?'}
                  </div>
                </button>
              );
            })}

            {/* Save Room Button */}
            <button
              onClick={() => {
                if (allImagesAccepted) {
                  setIsSaveModalOpen(true);
                } else {
                  alert('You must accept all images before saving the room.');
                }
              }}
              className={`fixed bottom-8 right-8 px-6 py-3 rounded-lg shadow-lg transition-colors duration-200 z-20 ${
                allImagesAccepted ? 'btn-loci' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!allImagesAccepted}
            >
              Save Room
            </button>

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
            {isSaveModalOpen && (
              <SaveRoomModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onSave={handleSaveRoom}
                acceptedImages={acceptedImages}
                roomType={roomType}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizerPage;
