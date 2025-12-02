import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROOM_IMAGES, ROOM_ANCHOR_POSITIONS } from '../constants/roomData';
import ImagePopup from './ImagePopup';
import SaveRoomModal from './SaveRoomModal';
// import { generateImage } from '../services/imageService';
import NavBar from './NavBar';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { useToast } from '../context/ToastContext';
import { SecureAPIClient } from '../utils/security';

import { getApiUrl } from '../config/api';
const apiClient = new SecureAPIClient(getApiUrl(''));

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

    const response = await apiClient.post('/api/generate-images', {
      prompt: fullPrompt,
      association: association
    });


    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(errorData.error || 'Failed to generate image');
      error.response = { status: response.status, data: errorData };
      throw error;
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Image generation error:', error);
    throw error;
  }
};

const VisualizerPage = () => {
  const navigate = useNavigate();
  const [selectedAssociation, setSelectedAssociation] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  // Store accepted images in memory only (no localStorage to avoid quota issues)
  const [acceptedImages, setAcceptedImages] = useState({});

  // Store image metadata in localStorage (prompts, associations, etc. - no base64 data)
  const [imageMetadata, setImageMetadata] = useState(() => {
    const saved = localStorage.getItem('imageMetadata');
    return saved ? JSON.parse(saved) : {};
  });
  const prevImageMetadataRef = useRef();
  const prevPalaceAcceptedImagesRef = useRef();

  // Clean up old localStorage data on component mount
  useEffect(() => {
    // Remove old acceptedImages data to free up space
    localStorage.removeItem('acceptedImages');
  }, []);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showRecallModal, setShowRecallModal] = useState(false);
  const [savedPalaceName, setSavedPalaceName] = useState('');
  const { showSuccess, showError, showInfo } = useToast();

  // Get the current palace data from localStorage
  const currentPalace = JSON.parse(localStorage.getItem('currentPalace') || '{}');
  const { roomType = 'throne room', associations = [], acceptedImages: palaceAcceptedImages = {}, name: palaceName = '', _id: palaceId = null } = currentPalace;



  // Load accepted images from palace data on component mount and when palace data changes
  useEffect(() => {
    const currentImagesString = JSON.stringify(palaceAcceptedImages);
    const prevImagesString = JSON.stringify(prevPalaceAcceptedImagesRef.current);



    if (currentImagesString !== prevImagesString && palaceAcceptedImages && Object.keys(palaceAcceptedImages).length > 0) {
      // Convert Map to object if needed
      const imagesObject = palaceAcceptedImages instanceof Map
        ? Object.fromEntries(palaceAcceptedImages)
        : palaceAcceptedImages;

      setAcceptedImages(imagesObject);
      prevPalaceAcceptedImagesRef.current = palaceAcceptedImages;

      // Clear old imageMetadata when loading a new palace to avoid showing old data
      setImageMetadata({});
      localStorage.removeItem('imageMetadata');
    }
  }, [palaceAcceptedImages, currentPalace]); // Added currentPalace dependency

  // Save image metadata to localStorage whenever it changes (no base64 data)
  useEffect(() => {
    const currentMetadataString = JSON.stringify(imageMetadata);
    const prevMetadataString = JSON.stringify(prevImageMetadataRef.current);

    if (currentMetadataString !== prevMetadataString) {
      localStorage.setItem('imageMetadata', currentMetadataString);
      prevImageMetadataRef.current = imageMetadata;
    }
  }, [imageMetadata]);

  // Show welcome modal for new palaces (no accepted images yet)
  useEffect(() => {
    const hasAcceptedImages = Object.keys(acceptedImages).length > 0 ||
                               (palaceAcceptedImages && Object.keys(palaceAcceptedImages).length > 0);
    const welcomeShown = sessionStorage.getItem('welcomeModalShown');

    // Show welcome modal if no images accepted and haven't shown it this session
    if (!hasAcceptedImages && !welcomeShown && associations.length > 0) {
      setShowWelcomeModal(true);
      sessionStorage.setItem('welcomeModalShown', 'true');
    }
  }, [acceptedImages, palaceAcceptedImages, associations]);

  // Get the appropriate room image
  const roomImage = ROOM_IMAGES[roomType] || ROOM_IMAGES["throne room"];

  // Get the appropriate anchor positions for this room
  const anchorPositions = ROOM_ANCHOR_POSITIONS[roomType] || ROOM_ANCHOR_POSITIONS["throne room"];

  // Check if all images have been accepted (only for visible associations)
  const visibleAssociations = associations.filter(
    assoc => anchorPositions[assoc.anchor] && assoc.memorableItem
  );

    // Helper function to check if an image is accepted (either in memory or metadata)
  const isImageAccepted = (assoc) => {
    // Check if we have an accepted image in memory
    if (acceptedImages[assoc.anchor] && acceptedImages[assoc.anchor].image) {
      return true;
    }

    // Check if we have metadata for this anchor (but only if it's not just a placeholder)
    if (imageMetadata[assoc.anchor] && imageMetadata[assoc.anchor].association) {
      return true;
    }

    return false;
  };

  const allImagesAccepted = visibleAssociations.every(isImageAccepted);

  // Calculate progress for save button
  const acceptedCount = visibleAssociations.filter(isImageAccepted).length;
  const totalCount = visibleAssociations.length;
  const progressPercentage = totalCount > 0 ? Math.round((acceptedCount / totalCount) * 100) : 0;

  const handleSaveRoom = async (roomData) => {
    try {
      // Clear localStorage to free up space before saving
      localStorage.removeItem('currentPalace');
      localStorage.removeItem('imageMetadata');
      // Create the palace data for the API
      const palaceData = {
        name: roomData.name,
        roomType: roomType,
        associations: associations.map(assoc => ({
          anchor: assoc.anchor,
          memorableItem: assoc.memorableItem,
          description: assoc.description,
          hasAcceptedImage: isImageAccepted(assoc)
        })),
        acceptedImages: acceptedImages, // Include the actual accepted images data (backend will store this)
        completionStatus: {
          totalAnchors: totalCount,
          acceptedImages: acceptedCount,
          isComplete: allImagesAccepted,
          progressPercentage: progressPercentage
        }
      };



      let response;
      let isUpdate = false;

      // Check if we're updating an existing palace
      if (palaceId) {
        // Update existing palace
        response = await apiClient.put(`/api/memory-palaces/${palaceId}`, palaceData);
        isUpdate = true;
      } else {
        // Create new palace
        response = await apiClient.post('/api/memory-palaces', palaceData);
      }

            if (!response.ok) {
        const data = await response.json();
        const errorObj = new Error(data.message || `Failed to ${isUpdate ? 'update' : 'save'} memory palace`);
        errorObj.response = { data, status: response.status };
        throw errorObj;
      }

      const savedPalace = await response.json();

      // Update localStorage with the saved palace data (including the ID for future updates)
      // Only store essential data, not the full acceptedImages to avoid quota issues
      const palaceDataForStorage = {
        _id: savedPalace._id,
        name: savedPalace.name,
        roomType: savedPalace.roomType,
        associations: savedPalace.associations,
        completionStatus: savedPalace.completionStatus,
        acceptedImages: {} // Don't store full image data in localStorage
      };
      localStorage.setItem('currentPalace', JSON.stringify(palaceDataForStorage));

      // Update local state with the saved palace data to ensure images persist
      if (savedPalace.acceptedImages) {
        setAcceptedImages(savedPalace.acceptedImages);
      }

      setIsSaveModalOpen(false);
      const action = isUpdate ? 'updated' : 'saved';
      const saveMessage = allImagesAccepted
        ? `Memory palace "${roomData.name}" ${action} successfully!`
        : `Memory palace "${roomData.name}" ${action} with ${acceptedCount}/${totalCount} images accepted.`;
      showSuccess(saveMessage);

      // Show recall instructions modal if palace is complete
      if (allImagesAccepted && !isUpdate) {
        setSavedPalaceName(roomData.name);
        setShowRecallModal(true);
      }

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
      // Check if we have an accepted image for this anchor (in memory or metadata)
      if (acceptedImages[association.anchor] && acceptedImages[association.anchor].image) {
        const imagePath = acceptedImages[association.anchor].image;
        // If it's a file path (starts with /), prefix with backend URL
        const fullImageUrl = imagePath.startsWith('/')
                          ? `${getApiUrl('')}${imagePath}`
          : imagePath;
        setGeneratedImage(fullImageUrl);
        setCurrentPrompt(acceptedImages[association.anchor].prompt);
      } else if (imageMetadata[association.anchor]) {
        // Image was accepted but not in memory (e.g., after page reload)
        // We'll need to regenerate it

      } else {
        // Generate new image if no accepted image exists
        const result = await generateImage(association, setCurrentPrompt);
        console.log('Received result from generateImage:', {
          success: result.success,
          hasImageData: !!result.imageData,
          imageDataLength: result.imageData ? result.imageData.length : 0,
          hasOptimizedUrl: !!result.optimizedUrl,
          hasImageUrl: !!result.imageUrl,
          prompt: result.prompt
        });
        // Handle base64 image data from backend
        if (result.imageData) {
          // Check if it's a placeholder (SVG) or real image (PNG)
          const mimeType = result.isPlaceholder ? 'image/svg+xml' : 'image/png';
          const imageUrl = `data:${mimeType};base64,${result.imageData}`;
          console.log('Setting generated image with base64 data, length:', imageUrl.length);
          console.log('Using MIME type:', mimeType);
          setGeneratedImage(imageUrl);
        } else {
          console.log('No imageData, using URL:', result.optimizedUrl || result.imageUrl);
          setGeneratedImage(result.optimizedUrl || result.imageUrl);
        }
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
      // Store in memory (for immediate use)
      setAcceptedImages(prev => ({
        ...prev,
        [selectedAssociation.anchor]: {
          image: generatedImage,
          prompt: currentPrompt,
          association: selectedAssociation
        }
      }));

      // Store metadata in localStorage (for persistence across page reloads)
      setImageMetadata(prev => ({
        ...prev,
        [selectedAssociation.anchor]: {
          prompt: currentPrompt,
          association: selectedAssociation,
          timestamp: Date.now()
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
        // Handle base64 image data from backend
        if (result.imageData) {
          setGeneratedImage(`data:image/png;base64,${result.imageData}`);
        } else {
          setGeneratedImage(result.optimizedUrl || result.imageUrl);
        }
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
        // Handle base64 image data from backend
        if (result.imageData) {
          setGeneratedImage(`data:image/png;base64,${result.imageData}`);
        } else {
          setGeneratedImage(result.optimizedUrl || result.imageUrl);
        }
        setCurrentPrompt(result.prompt);
      } catch (err) {
        console.error('Image generation error:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4E8DED]/60 via-[#4E8DED]/30 to-white">
      <NavBar />
      <div className="py-12 px-4">
        {/* Top actions: navigation + How to Use */}
        <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center">
          <div className="flex gap-3">
            <button
              type="button"
              className="px-4 py-2 bg-primary text-white rounded shadow hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent1"
              onClick={() => navigate('/saved-rooms')}
            >
              ← Back to Dashboard
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-primary text-white rounded shadow hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent1"
              onClick={() => navigate('/input')}
            >
              + New Palace
            </button>
          </div>
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
                  <strong>Save Your Palace:</strong> Click "Save Progress" at any time to save your work, or "Save Palace" when all images are accepted.
                </li>
              </ol>
            </div>
          </div>
        )}
        {/* Welcome Modal for New Palaces */}
        {showWelcomeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" role="dialog" aria-modal="true" aria-labelledby="welcome-modal-title">
            <div className="bg-white rounded-lg p-8 shadow-lg max-w-2xl w-full relative">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-accent1"
                onClick={() => setShowWelcomeModal(false)}
                aria-label="Close welcome"
              >
                &times;
              </button>
              <h2 className="text-3xl font-bold mb-4 text-primary" id="welcome-modal-title">Welcome to Your Memory Palace!</h2>
              <p className="text-gray-700 mb-6 text-lg">
                Your memory palace has been created! Here's what to do next:
              </p>
              <ol className="list-decimal pl-6 space-y-4 mb-6 text-gray-700">
                <li>
                  <strong>Click on Anchor Points:</strong> Look for the highlighted areas (marked with "?") in the room. Click on any of these anchor points to generate an image for that location.
                </li>
                <li>
                  <strong>Review the Generated Image:</strong> A popup will show you an AI-generated image representing your memorable item at that location.
                </li>
                <li>
                  <strong>Accept or Reject:</strong> If you like the image, click "Accept" to save it. If not, click "Reject" to generate a new one.
                </li>
                <li>
                  <strong>Complete All Points:</strong> Continue clicking on anchor points and accepting images until all points have been completed (you'll see a checkmark ✓ on accepted points).
                </li>
                <li>
                  <strong>Save Your Palace:</strong> Once you're happy with your images, click "Save Palace" in the bottom-right corner to save your memory palace for later review.
                </li>
              </ol>
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-gray-700 text-sm">
                  <strong>Tip:</strong> The spatial layout of the room helps your brain remember. Take time to notice where each image is placed! Once saved, you can mentally "walk through" this room to recall your memorables.
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowWelcomeModal(false)}
                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Recall Instructions Modal - shown after saving complete palace */}
        {showRecallModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" role="dialog" aria-modal="true" aria-labelledby="recall-modal-title">
            <div className="bg-white rounded-lg p-8 shadow-lg max-w-2xl w-full relative">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-accent1"
                onClick={() => setShowRecallModal(false)}
                aria-label="Close recall instructions"
              >
                &times;
              </button>
              <h2 className="text-3xl font-bold mb-4 text-primary" id="recall-modal-title">How to Use Your Memory Palace for Recall</h2>
              <p className="text-gray-700 mb-6 text-lg">
                Great! Your memory palace "<strong>{savedPalaceName}</strong>" is complete. Here's how to use it to remember your items:
              </p>
              <ol className="list-decimal pl-6 space-y-4 mb-6 text-gray-700">
                <li>
                  <strong>Mentally Walk Through the Room:</strong> Close your eyes and visualize yourself entering the room. Start from one end and move through the space in a logical path.
                </li>
                <li>
                  <strong>Visit Each Anchor Point:</strong> As you mentally visit each location where you placed an image, visualize the image you accepted for that spot.
                </li>
                <li>
                  <strong>Recall the Memorable Item:</strong> The vivid image at each location will trigger your memory of the associated item. Let the visual cue remind you of what you wanted to remember.
                </li>
                <li>
                  <strong>Practice Regularly:</strong> Return to this memory palace periodically and mentally walk through it. The more you practice, the stronger your recall will become.
                </li>
                <li>
                  <strong>Review on the Dashboard:</strong> You can always come back to view your saved palace on your dashboard to refresh your memory of the images and locations.
                </li>
              </ol>
              <div className="bg-purple-50 p-4 rounded-lg mb-6">
                <p className="text-gray-700 text-sm">
                  <strong>Why This Works:</strong> Your brain is excellent at remembering spatial relationships and visual images. By connecting information to specific locations in a room, you're using one of the most powerful memory systems available!
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowRecallModal(false)}
                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  Got it!
                </button>
              </div>
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
            const hasAcceptedImage = isImageAccepted(assoc);

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
                    ? 'bg-secondary bg-opacity-90'
                    : 'bg-primary bg-opacity-90'
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

          {/* Save Palace Button - bottom right of image container */}
          <div className="absolute bottom-6 right-6 z-20">
            <button
              onClick={() => setIsSaveModalOpen(true)}
              className="group relative px-6 py-3 rounded-xl shadow-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent1 focus-visible:ring-offset-2 bg-primary hover:bg-primary-dark text-white"
              aria-describedby="save-room-help"
            >
              <div className="flex items-center space-x-2">
                {/* Text */}
                <span className="font-semibold">
                  {allImagesAccepted ? 'Save Palace' : 'Save Progress'}
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

          {/* Save Palace Modal */}
          {isSaveModalOpen && (
            <SaveRoomModal
              isOpen={isSaveModalOpen}
              onClose={() => setIsSaveModalOpen(false)}
              onSave={handleSaveRoom}
              acceptedImages={acceptedImages}
              roomType={roomType}
              existingRoomName={palaceName}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualizerPage;
