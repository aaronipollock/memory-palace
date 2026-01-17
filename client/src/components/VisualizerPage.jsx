import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROOM_IMAGES, ROOM_ANCHOR_POSITIONS } from '../constants/roomData';
import ImagePopup from './ImagePopup';
import SaveRoomModal from './SaveRoomModal';
import { generateImage, generateStrangerImage } from '../services/imageService';
import NavBar from './NavBar';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { useToast } from '../context/ToastContext';
import { SecureAPIClient } from '../utils/security';

import { getApiUrl } from '../config/api';
const apiClient = new SecureAPIClient(getApiUrl(''));

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
  const {
    roomType = 'throne room',
    associations = [],
    acceptedImages: palaceAcceptedImages = {},
    name: palaceName = '',
    _id: palaceId = null,
    customRoomImageUrl = null,
    customRoomId = null
  } = currentPalace;



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

  // State for custom room anchor points
  const [customRoomAnchorPoints, setCustomRoomAnchorPoints] = useState([]);

  // Fetch custom room data if customRoomId is present
  useEffect(() => {
    const fetchCustomRoom = async () => {
      if (customRoomId) {
        try {
          const response = await apiClient.get(`/api/custom-rooms/${customRoomId}`);
          if (response.ok) {
            const roomData = await response.json();
            setCustomRoomAnchorPoints(roomData.anchorPoints || []);
          }
        } catch (err) {
          console.error('Error fetching custom room:', err);
        }
      } else {
        setCustomRoomAnchorPoints([]);
      }
    };
    fetchCustomRoom();
  }, [customRoomId]);

  // Get the appropriate room image
  // If a custom room is selected, use its image URL, otherwise use the predefined room image
  const roomImage = customRoomImageUrl || ROOM_IMAGES[roomType] || ROOM_IMAGES["throne room"];

  // Get the appropriate anchor positions for this room
  // For custom rooms, convert anchor points (x, y percentages) to the format used by the visualizer
  const anchorPositions = useMemo(() => {
    if (customRoomId && customRoomAnchorPoints.length > 0) {
      // Convert custom room anchor points to the visualizer format
      const positions = {};
      customRoomAnchorPoints.forEach((point) => {
        positions[point.name] = {
          top: `${point.y}%`,
          left: `${point.x}%`,
          width: '40px',
          height: '40px'
        };
      });
      return positions;
    }
    // Use predefined positions for standard rooms
    return ROOM_ANCHOR_POSITIONS[roomType] || ROOM_ANCHOR_POSITIONS["throne room"];
  }, [customRoomId, customRoomAnchorPoints, roomType]);

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

      // Only include custom room fields if they have values
      if (customRoomId) {
        palaceData.customRoomId = customRoomId;
      }
      if (customRoomImageUrl) {
        palaceData.customRoomImageUrl = customRoomImageUrl;
      }



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
        acceptedImages: {}, // Don't store full image data in localStorage
        customRoomId: savedPalace.customRoomId || null,
        customRoomImageUrl: savedPalace.customRoomImageUrl || null
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
        // Navigation will happen when recall modal is closed
      } else {
        // Navigate to dashboard immediately if no recall modal
        setTimeout(() => {
          navigate('/saved-rooms');
        }, 1000); // Small delay to let user see the success message
      }

      // Don't clear accepted images after save - let user continue working
      // setAcceptedImages({});
      // localStorage.removeItem('acceptedImages');
    } catch (err) {
      console.error('Error saving palace:', err);
      // Show the actual error message from the backend if available
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to save memory palace. Please try again.';
      showError(errorMessage);
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
        console.log('Generating image for association:', association);
        const result = await generateImage(association, setCurrentPrompt);
        console.log('Image generation result:', {
          hasImageData: !!result.imageData,
          hasOptimizedUrl: !!result.optimizedUrl,
          hasImageUrl: !!result.imageUrl,
          isPlaceholder: result.isPlaceholder
        });
        // Handle base64 image data from backend
        if (result.imageData) {
          // Check if it's a placeholder (SVG) or real image (PNG)
          const mimeType = result.isPlaceholder ? 'image/svg+xml' : 'image/png';
          const imageUrl = `data:${mimeType};base64,${result.imageData}`;
          setGeneratedImage(imageUrl);
        } else {
          setGeneratedImage(result.optimizedUrl || result.imageUrl);
        }
        setCurrentPrompt(result.prompt);
      }
    } catch (err) {
      console.error('Image generation error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      });
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
      showInfo('Making it stranger...');
      setIsLoading(true);
      setError(null);
      setGeneratedImage(null);
      setCurrentPrompt('');

      try {
        // Use "Make it Stranger" instead of regular regenerate
        const result = await generateStrangerImage(selectedAssociation, setCurrentPrompt);
        // Handle base64 image data from backend
        if (result.imageData) {
          setGeneratedImage(`data:image/png;base64,${result.imageData}`);
        } else {
          setGeneratedImage(result.optimizedUrl || result.imageUrl);
        }
        setCurrentPrompt(result.prompt);
        showSuccess('Stranger image generated!');
      } catch (err) {
        console.error('Image generation error:', err);
        setError(err);
        showError('Failed to generate stranger image. Please try again.');
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
    <div className="page-bg-visualizer">
      <NavBar />
      <div className="py-12 px-4">
        {/* Top actions: navigation + How to Use */}
        <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center">
          <div className="flex gap-3">
            <button
              type="button"
              className="px-4 py-2 bg-primary text-white rounded shadow hover:bg-[#7C3AED] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent1"
              onClick={() => navigate('/saved-rooms')}
            >
              ← Back to Dashboard
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-primary text-white rounded shadow hover:bg-[#7C3AED] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent1"
              onClick={() => navigate('/input')}
            >
              + New Palace
            </button>
          </div>
          <div className="flex gap-3 items-center">
            {/* Save Palace Button - moved here to avoid covering anchor points */}
            <button
              onClick={() => setIsSaveModalOpen(true)}
              className="group relative px-6 py-2 rounded-xl shadow-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent1 focus-visible:ring-offset-2 bg-primary hover:bg-[#7C3AED] text-white"
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
            <button
              className="px-4 py-2 bg-primary text-white rounded shadow hover:bg-[#7C3AED] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent1"
              onClick={() => setShowInstructionsModal(true)}
              aria-describedby="instructions-help"
            >
              How to Use
            </button>
            <div id="instructions-help" className="sr-only">
              Click to view instructions on how to use your memory palace.
            </div>
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
                onClick={() => {
                  setShowRecallModal(false);
                  // Navigate to dashboard after closing recall modal
                  setTimeout(() => {
                    navigate('/saved-rooms');
                  }, 300);
                }}
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
                  onClick={() => {
                    setShowRecallModal(false);
                    // Navigate to dashboard after closing recall modal
                    setTimeout(() => {
                      navigate('/saved-rooms');
                    }, 300);
                  }}
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
            // Get the display number (1-based index for visible associations only)
            const visibleIndex = visibleAssociations.findIndex(v => v.anchor === assoc.anchor && v.memorableItem === assoc.memorableItem);
            const displayNumber = visibleIndex >= 0 ? visibleIndex + 1 : index + 1;

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
                aria-label={`${assoc.anchor} anchor point ${displayNumber}${hasAcceptedImage ? ' - image accepted' : ' - click to generate image'}`}
                aria-describedby={`anchor-${index}-desc`}
              >
                <div className={`w-full h-full flex items-center justify-center rounded transition-all duration-200 ${
                  hasAcceptedImage
                    ? 'bg-secondary bg-opacity-80'
                    : 'bg-primary bg-opacity-80'
                }`}>
                  {isLoading && selectedAssociation?.anchor === assoc.anchor ? (
                    <LoadingSpinner size="sm" text="" />
                  ) : (
                    <span className="text-xl font-bold text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]">
                      {displayNumber}
                    </span>
                  )}
                </div>
                <div id={`anchor-${index}-desc`} className="sr-only">
                  {hasAcceptedImage
                    ? `Anchor point ${displayNumber}: Image for ${assoc.memorableItem} at ${assoc.anchor} has been accepted.`
                    : `Anchor point ${displayNumber}: Click to generate an image for ${assoc.memorableItem} at ${assoc.anchor}.`
                  }
                </div>
              </button>
            );
          })}


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
