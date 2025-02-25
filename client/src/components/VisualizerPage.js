import React, { useState } from 'react';
import axios from 'axios';

const LIVING_ROOM_IMAGE = 'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

// Predefined clickable areas for each anchor point based on the new image layout
const ANCHOR_POSITIONS = {
  'sofa': { top: '65%', left: '25%', width: '450px', height: '150px' },
  'painting': { top: '35%', left: '25%', width: '250px', height: '170px' },
  'coffee table': { top: '90%', left: '48%', width: '270px', height: '100px' },
  'window': { top: '45%', left: '70%', width: '150px', height: '170px' },
  'plant': { top: '60%', left: '90%', width: '100px', height: '200px' }
};

// Placeholder images for when the API fails
const PLACEHOLDER_IMAGES = {
  'sofa': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format',
  'painting': 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&auto=format',
  'coffee table': 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&auto=format',
  'window': 'https://images.unsplash.com/photo-1592492152545-9695d3f473f4?w=500&auto=format',
  'plant': 'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=500&auto=format'
};

const VisualizerPage = ({ associations, roomType }) => {
  const [selectedAssociation, setSelectedAssociation] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0, transform: null });

  // Get associations from props or localStorage
  const storedAssociations = associations.length > 0 ? associations :
      JSON.parse(localStorage.getItem('associations') || '[]');

  console.log('Using associations:', storedAssociations);

  const generatePrompt = (association) => {
    return `A vivid, surreal image of a ${association.memorable} interacting with a ${association.anchor} in a living room.
    The scene should be clear and memorable, with the ${association.memorable} being the main focus as it interacts with the ${association.anchor}.
    Photorealistic style.`;
  };

  const handleClick = async (association, event) => {
    // Calculate popup position based on the clicked button's position
    const rect = event.currentTarget.getBoundingClientRect();

    // Adjust position based on the anchor type
    let transformValue = 'translate(-50%, -120%)'; // Default positioning (above)

    // For painting, window, and sofa, position the popup below instead of above
    if (association.anchor === 'painting' ||
        association.anchor === 'window' ||
        association.anchor === 'sofa') {
      transformValue = 'translate(-50%, 20%)'; // Position below
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

    try {
      const prompt = generatePrompt(association);
      console.log('Sending prompt:', prompt);

      const response = await axios.post('http://localhost:5000/api/generate-image', {
        prompt,
        association
      });

      console.log('Response:', response.data);

      if (response.data && response.data.imageUrl) {
        const fullImageUrl = `http://localhost:5000${response.data.imageUrl}`;
        console.log('Setting image URL:', fullImageUrl);
        setGeneratedImage(fullImageUrl);
      } else {
        throw new Error('No image URL in response');
      }
    } catch (err) {
      setError('Using placeholder image due to generation error.');
      console.error('Image generation error:', err);

      // Use a placeholder image instead
      const placeholderImage = PLACEHOLDER_IMAGES[association.anchor] ||
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format';
      setGeneratedImage(placeholderImage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClosePopup = () => {
    setSelectedAssociation(null);
    setGeneratedImage(null);
    setError(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-primary">Your Memory Palace</h2>
      <div className="relative w-full max-w-6xl mx-auto">
        <img
          src={LIVING_ROOM_IMAGE}
          alt="Living Room"
          className="w-full h-auto rounded-lg shadow-lg"
          style={{ maxHeight: '80vh' }}
        />
        {storedAssociations.map((assoc, index) => (
          <button
            key={index}
            className="absolute cursor-pointer"
            style={{
              ...ANCHOR_POSITIONS[assoc.anchor],
              position: 'absolute',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              backgroundColor: 'rgba(255, 0, 0, 0.2)',
              border: '2px solid red'
            }}
            onClick={(e) => handleClick(assoc, e)}
          >
            <span className="text-white bg-black bg-opacity-50 p-1 rounded">
              {assoc.anchor}
            </span>
          </button>
        ))}

        {/* Popup for generated image - updated to use dynamic transform */}
        {selectedAssociation && (
          <div
            className="fixed bg-white rounded-lg shadow-xl p-4 z-50"
            style={{
              left: `${popupPosition.x}px`,
              top: `${popupPosition.y}px`,
              transform: popupPosition.transform || 'translate(-50%, -120%)',
              maxWidth: '300px'
            }}
          >
            <button
              onClick={handleClosePopup}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
            <h3 className="text-lg font-bold mb-2">
              {selectedAssociation.anchor}: {selectedAssociation.memorable}
            </h3>

            {isLoading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2">Generating...</p>
              </div>
            )}

            {error && (
              <div className="text-red-500 text-center py-2">
                {error}
              </div>
            )}

            {generatedImage && (
              <img
                src={generatedImage}
                alt="Generated Association"
                className="rounded-lg shadow-md max-w-full h-auto"
                onError={(e) => {
                  console.error('Image failed to load:', e);
                  setError('Failed to load generated image');
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualizerPage;
