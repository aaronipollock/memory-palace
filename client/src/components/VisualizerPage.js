import React, { useState } from 'react';
import axios from 'axios';

// Use the living room image from InputPage
const THRONE_ROOM_IMAGE = 'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

// Predefined clickable areas for each anchor point
const ANCHOR_POSITIONS = {
  'sofa': { top: '65%', left: '25%', width: '450px', height: '150px' },
  'painting': { top: '35%', left: '25%', width: '250px', height: '170px' },
  'coffee table': { top: '90%', left: '48%', width: '270px', height: '100px' },
  'window': { top: '45%', left: '70%', width: '150px', height: '170px' },
  'plant': { top: '60%', left: '90%', width: '100px', height: '200px' }
};

// Fallback images only if API completely fails
const FALLBACK_IMAGES = {
  'sofa': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format',
  'painting': 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&auto=format',
  'coffee table': 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&auto=format',
  'window': 'https://images.unsplash.com/photo-1592492152545-9695d3f473f4?w=500&auto=format',
  'plant': 'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=500&auto=format',
  'default': 'https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=500&auto=format'
};

const VisualizerPage = ({ associations, roomType }) => {
  const [selectedAssociation, setSelectedAssociation] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0, transform: null });

  // Get associations from props or localStorage
  const storedAssociations = associations?.length > 0 ? associations :
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
      // Generate the prompt for Stability AI
      const prompt = generatePrompt(association);
      console.log('Sending prompt to API:', prompt);

      // Make the API request with proper headers and timeout
      const response = await axios.post('http://localhost:5000/api/generate-image', {
        prompt,
        association
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });

      console.log('API Response:', response.data);

      // Check if we got a valid response with an image URL
      if (response.data && response.data.imageUrl) {
        // Fix the URL path if needed
        let imageUrl = response.data.imageUrl;

        // If the URL starts with /public, prepend the server URL
        if (imageUrl.startsWith('/public')) {
          imageUrl = `http://localhost:5000${imageUrl}`;
        }

        console.log('Setting generated image URL:', imageUrl);
        setGeneratedImage(imageUrl);
      } else {
        console.error('Invalid API response:', response.data);
        throw new Error('No image URL in API response');
      }
    } catch (err) {
      console.error('Image generation error:', err);

      // Show a more detailed error message
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        setError(`API error (${err.response.status}): ${err.response.data.message || 'Unknown error'}`);
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request);
        setError('No response from server. Is the backend running?');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request setup error:', err.message);
        setError(`Error: ${err.message}`);
      }

      // Use a fallback image as last resort
      const fallbackImage = FALLBACK_IMAGES[association.anchor] || FALLBACK_IMAGES['default'];
      console.log('Using fallback image:', fallbackImage);
      setGeneratedImage(fallbackImage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClosePopup = () => {
    setSelectedAssociation(null);
    setGeneratedImage(null);
  };

  return (
    <div className="mario-bg mario-clouds min-h-screen py-12 px-4">
      <h2 className="mario-header text-2xl mb-8 text-center">YOUR MEMORY CASTLE</h2>

      <div className="relative w-full max-w-6xl mx-auto mario-castle p-4">
        <img
          src={THRONE_ROOM_IMAGE}
          alt="Throne Room"
          className="w-full h-auto rounded-lg"
          style={{ maxHeight: '80vh' }}
        />

        {storedAssociations.map((assoc, index) => (
          <button
            key={index}
            className="absolute cursor-pointer question-block"
            style={{
              ...ANCHOR_POSITIONS[assoc.anchor],
              position: 'absolute',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              width: '40px',
              height: '40px',
            }}
            onClick={(e) => handleClick(assoc, e)}
          >
          </button>
        ))}

        {/* Popup for generated image */}
        {selectedAssociation && (
          <div
            className="fixed bg-white rounded-lg shadow-xl p-4 z-50 pipe"
            style={{
              left: `${popupPosition.x}px`,
              top: `${popupPosition.y}px`,
              transform: popupPosition.transform || 'translate(-50%, -120%)',
              maxWidth: '300px',
              backgroundColor: '#fff',
              border: '4px solid #5b8200'
            }}
          >
            <button
              onClick={handleClosePopup}
              className="absolute top-2 right-2 text-white bg-primary hover:bg-red-700 w-8 h-8 flex items-center justify-center rounded-full"
            >
              ×
            </button>

            <h3 className="mario-header text-sm mb-3 text-primary">
              {selectedAssociation.anchor}: {selectedAssociation.memorable}
            </h3>

            {isLoading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-secondary">Loading image from Stability AI...</p>
              </div>
            )}

            {error && (
              <div className="text-red-500 text-center py-2 bg-white rounded p-1">
                {error}
              </div>
            )}

            {generatedImage && (
              <div className="mt-3">
                <img
                  src={generatedImage}
                  alt={`${selectedAssociation.memorable} with ${selectedAssociation.anchor}`}
                  className="rounded-lg shadow-md max-w-full h-auto coin"
                  onError={(e) => {
                    console.error('Image failed to load:', e);
                    setError('Failed to load the generated image');

                    // Only use fallback if the src is not already a fallback
                    const isFallback = Object.values(FALLBACK_IMAGES).includes(e.target.src);
                    if (!isFallback) {
                      e.target.src = FALLBACK_IMAGES[selectedAssociation.anchor] || FALLBACK_IMAGES['default'];
                    }
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualizerPage;
