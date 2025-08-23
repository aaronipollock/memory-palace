import React, { useState, useEffect } from 'react';
import { ROOM_IMAGES, ROOM_ANCHOR_POSITIONS } from '../constants/roomData';
import ImagePopup from './ImagePopup';
import SaveRoomModal from './SaveRoomModal';
// import { generateImage } from '../services/imageService';
import NavBar from './NavBar';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { useToast } from '../context/ToastContext';
import { SecureAPIClient } from '../utils/security';

const API_URL = 'http://localhost:5001';
const apiClient = new SecureAPIClient(API_URL);

// Temporary inline generateImage function
const generateImage = async (association, setCurrentPrompt) => {
  try {
    // Simple prompt generation
    const verb = ['on', 'next to', 'inside', 'above', 'below', 'behind', 'in front of', 'around'][Math.floor(Math.random() * 8)];
    const adjective = ['giant', 'tiny', 'glowing', 'colorful', 'transparent', 'bright', 'sparkling', 'floating'][Math.floor(Math.random() * 8)];
    const artStyle = ['digital art', 'realistic', 'detailed illustration', 'high quality render'][Math.floor(Math.random() * 4)];

    const concreteImage = association.memorableItem;
    const description = `a ${adjective} ${concreteImage}, clearly visible and prominent`;
    const core = `${description} ${verb} a ${association.anchor}`;
    const fullPrompt = `${core}, ${artStyle}, centered composition, clear focus on the ${concreteImage}.`;
    const displayPrompt = `${core}.`;

    if (setCurrentPrompt) {
      setCurrentPrompt(displayPrompt);
    }

    // Make API request with SecureAPIClient to include authentication
    console.log('Making image generation request with prompt:', fullPrompt);
    console.log('Current token in localStorage:', localStorage.getItem('token'));
    const response = await apiClient.post('/api/generate-images', {
      prompt: fullPrompt,
      association: association
    });
    console.log('Image generation response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(errorData.error || 'Failed to generate image');
      error.response = { status: response.status, data: errorData };
      throw error;
    }

    const data = await response.json();
    console.log('Backend image generation response:', data);
    return data;
  } catch (error) {
    console.error('Image generation error:', error);
    throw error;
  }
};

const VisualizerPage = () => {
  const [selectedAssociation, setSelectedAssociation] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [acceptedImages, setAcceptedImages] = useState(() => {
    const saved = localStorage.getItem('acceptedImages');
    return saved ? JSON.parse(saved) : {};
  });
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const { showSuccess, showError, showInfo } = useToast();

  // Get the current palace data from localStorage
  const currentPalace = JSON.parse(localStorage.getItem('currentPalace') || '{}');
  const { roomType = 'throne room', associations = [] } = currentPalace;

  // Save accepted images to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('acceptedImages', JSON.stringify(acceptedImages));
  }, [acceptedImages]);

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

  // Calculate progress for save button
  const acceptedCount = visibleAssociations.filter(assoc =>
    acceptedImages[assoc.anchor] && acceptedImages[assoc.anchor].image
  ).length;
  const totalCount = visibleAssociations.length;
  const progressPercentage = totalCount > 0 ? Math.round((acceptedCount / totalCount) * 100) : 0;

  const handleSaveRoom = async (roomData) => {
    try {
      // Create the palace data for the API
      const palaceData = {
        name: roomData.name,
        roomType: roomType,
        associations: associations.map(assoc => ({
          anchor: assoc.anchor,
          memorableItem: assoc.memorableItem,
          description: assoc.description,
          hasAcceptedImage: !!(acceptedImages[assoc.anchor] && acceptedImages[assoc.anchor].image)
        })),
        completionStatus: {
          totalAnchors: totalCount,
          acceptedImages: acceptedCount,
          isComplete: allImagesAccepted,
          progressPercentage: progressPercentage
        }
      };

      // Save to backend API
      const response = await apiClient.post('/api/memory-palaces', palaceData);

      if (!response.ok) {
        const data = await response.json();
        const errorObj = new Error(data.message || 'Failed to save memory palace');
        errorObj.response = { data, status: response.status };
        throw errorObj;
      }

      setIsSaveModalOpen(false);
      const saveMessage = allImagesAccepted
        ? `Memory palace "${roomData.name}" saved successfully!`
        : `Memory palace "${roomData.name}" saved with ${acceptedCount}/${totalCount} images accepted.`;
      showSuccess(saveMessage);

      // Don't clear accepted images after save - let user continue working
      // setAcceptedImages({});
      // localStorage.removeItem('acceptedImages');
    } catch (err) {
      console.error('Error saving palace:', err);
      showError('Failed to save memory palace. Please try again.');
    }
  };

  const handleClick = async (association, event) => {
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
        setGeneratedImage(result.optimizedUrl || result.imageUrl);
        setCurrentPrompt(result.prompt);
      }
    } catch (err) {
      console.error('Image generation error:', err);
      setError(err);
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
      showSuccess(`Image accepted for ${selectedAssociation.anchor}!`);
      handleClosePopup();
    }
  };

  const handleRejectImage = async () => {
    if (selectedAssociation) {
      showInfo('Generating new image...');
      setIsLoading(true);
      setError(null);
      setGeneratedImage(null);
      setCurrentPrompt('');

      try {
        const result = await generateImage(selectedAssociation, setCurrentPrompt);
        setGeneratedImage(result.optimizedUrl || result.imageUrl);
        setCurrentPrompt(result.prompt);
        showSuccess('New image generated!');
      } catch (err) {
        console.error('Image generation error:', err);
        setError(err);
        showError('Failed to generate new image. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRetryImageGeneration = async () => {
    if (selectedAssociation) {
      setIsLoading(true);
      setError(null);
      setGeneratedImage(null);
      setCurrentPrompt('');

      try {
        const result = await generateImage(selectedAssociation, setCurrentPrompt);
        setGeneratedImage(result.optimizedUrl || result.imageUrl);
        setCurrentPrompt(result.prompt);
      } catch (err) {
        console.error('Image generation error:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  console.log('Generated image for popup:', generatedImage);
  console.log('VisualizerPage rendered');

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4E8DED]/60 via-[#4E8DED]/30 to-white">
      <NavBar />
      <div className="py-12 px-4">
        {/* How to Use Button at the top */}
        <div className="max-w-5xl mx-auto mb-6 flex justify-end">
          <button
            className="px-4 py-2 bg-primary text-white rounded shadow hover:bg-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent1"
            onClick={() => setShowInstructionsModal(true)}
            aria-describedby="instructions-help"
          >
            How to Use
          </button>
          <div id="instructions-help" className="sr-only">
            Click to view instructions on how to use your memory palace.
          </div>
        </div>
        {/* Instructions Modal */}
        {showInstructionsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" role="dialog" aria-modal="true" aria-labelledby="instructions-modal-title">
            <div className="bg-white rounded-lg p-8 shadow-lg max-w-lg w-full relative">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-accent1"
                onClick={() => setShowInstructionsModal(false)}
                aria-label="Close instructions"
              >
                &times;
              </button>
              <h3 className="text-xl font-bold mb-4 text-primary" id="instructions-modal-title">How to Use Your Memory Palace</h3>
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
                  <strong>Save Your Palace:</strong> Click "Save Progress" at any time to save your work, or "Save Room" when all images are accepted.
                </li>
              </ol>
            </div>
          </div>
        )}
        {/* Image and anchors full width below */}
        <div className="relative w-full max-w-5xl loci-container p-4 mx-auto">
          <img
            src={roomImage}
            alt={`${roomType} memory palace room with interactive anchor points`}
            className="w-full h-auto rounded-lg aspect-[1/1]"
            style={{ maxHeight: '95vh' }}
          />

          {/* Status announcement for screen readers */}
          <div aria-live="polite" className="sr-only">
            {allImagesAccepted
              ? 'All images have been accepted. You can save your complete memory palace.'
              : `${acceptedCount} of ${totalCount} images accepted. You can save your progress at any time.`
            }
          </div>

          {associations.map((assoc, index) => {
            if (!anchorPositions[assoc.anchor] || !assoc.memorableItem) return null;

            // Check if this anchor has an accepted image
            const hasAcceptedImage = acceptedImages[assoc.anchor] && acceptedImages[assoc.anchor].image;

            return (
              <button
                key={index}
                className="absolute cursor-pointer loci-anchor focus:outline-none focus-visible:ring-2 focus-visible:ring-accent1"
                style={{
                  ...anchorPositions[assoc.anchor],
                  position: 'absolute',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                  width: '40px',
                  height: '40px',
                }}
                onClick={(e) => handleClick(assoc, e)}
                disabled={isLoading}
                aria-label={`${assoc.anchor} anchor point${hasAcceptedImage ? ' - image accepted' : ' - click to generate image'}`}
                aria-describedby={`anchor-${index}-desc`}
              >
                <div className={`w-full h-full flex items-center justify-center text-white text-lg font-bold transition-all duration-200 ${
                  hasAcceptedImage
                    ? 'bg-primary bg-opacity-90'
                    : 'bg-secondary bg-opacity-75'
                }`}>
                  {isLoading && selectedAssociation?.anchor === assoc.anchor ? (
                    <LoadingSpinner size="sm" text="" />
                  ) : hasAcceptedImage ? (
                    '✓'
                  ) : (
                    '?'
                  )}
                </div>
                <div id={`anchor-${index}-desc`} className="sr-only">
                  {hasAcceptedImage
                    ? `Image for ${assoc.memorableItem} at ${assoc.anchor} has been accepted.`
                    : `Click to generate an image for ${assoc.memorableItem} at ${assoc.anchor}.`
                  }
                </div>
              </button>
            );
          })}

          {/* Save Room Button - bottom right of image container */}
          <div className="absolute bottom-6 right-6 z-20">
            <button
              onClick={() => setIsSaveModalOpen(true)}
              className={`group relative px-6 py-3 rounded-xl shadow-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent1 focus-visible:ring-offset-2 ${
                allImagesAccepted
                  ? 'bg-primary hover:bg-primary-dark text-white'
                  : 'bg-secondary hover:bg-secondary-dark text-white'
              }`}
              aria-describedby="save-room-help"
            >
              <div className="flex items-center space-x-2">
                {/* Text */}
                <span className="font-semibold">
                  {allImagesAccepted ? 'Save Room' : 'Save Progress'}
                </span>

                {/* Pulse animation for incomplete palaces */}
                {!allImagesAccepted && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </div>

              {/* Hover effect */}
              <div className={`absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                allImagesAccepted ? 'bg-primary/20' : 'bg-secondary/20'
              }`}></div>
            </button>

            <div id="save-room-help" className="sr-only">
              {allImagesAccepted
                ? 'Click to save your completed memory palace with a name.'
                : `Click to save your memory palace progress. ${acceptedCount} of ${totalCount} images accepted.`
              }
            </div>
          </div>

          {/* Image Popup */}
          {selectedAssociation && (
            <ImagePopup
              association={selectedAssociation}
              image={generatedImage}
              prompt={currentPrompt}
              isLoading={isLoading}
              error={error}
              onClose={handleClosePopup}
              onAccept={handleAcceptImage}
              onReject={handleRejectImage}
              onRetry={handleRetryImageGeneration}
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
  );
};

export default VisualizerPage;
