import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Room images
const ROOM_IMAGES = {
  "throne room": "/images/throne_room.webp",
  "bedchamber": "/images/bedchamber.webp",
  "kitchen": "/images/kitchen.webp",
  "dining room": "/images/dining_room.webp",
  "dungeon": "/images/dungeon.webp",
  "bathroom": "/images/bathroom.webp",
  "study": "/images/study.webp",
  "game room": "/images/game_room.webp"
};

// Predefined clickable areas for each anchor point by room type
const ROOM_ANCHOR_POSITIONS = {
  "throne room": {
    'throne': { top: '60%', left: '50%', width: '150px', height: '150px' },
    'red carpet': { top: '85%', left: '55%', width: '200px', height: '100px' },
    'stained glass window': { top: '40%', left: '60%', width: '150px', height: '150px' },
    'chandelier': { top: '20%', left: '45%', width: '150px', height: '100px' },
    'foot stool': { top: '90%', left: '68%', width: '100px', height: '80px' },
    'statue': { top: '60%', left: '70%', width: '100px', height: '200px' },
    'candle stick': { top: '60%', left: '35%', width: '80px', height: '150px' }
  },
  "bedchamber": {
    'bed': { top: '65%', left: '50%', width: '200px', height: '150px' },
    'wardrobe': { top: '65%', left: '75%', width: '80px', height: '80px' },
    'nightstand': { top: '70%', left: '35%', width: '100px', height: '100px' },
    'lamp': { top: '55%', left: '68%', width: '80px', height: '120px' },
    'mirror': { top: '40%', left: '25%', width: '150px', height: '120px' },
    'dresser': { top: '70%', left: '25%', width: '150px', height: '120px' },
    'rug': { top: '90%', left: '50%', width: '200px', height: '100px' }
  },
  "dungeon": {
    'gate': { top: '50%', left: '50%', width: '200px', height: '120px' },
    'table': { top: '70%', left: '30%', width: '100px', height: '120px' },
    'pillory': { top: '60%', left: '65%', width: '120px', height: '100px' },
    'grate': { top: '80%', left: '40%', width: '120px', height: '200px' },
    'barrel': { top: '90%', left: '50%', width: '100px', height: '150px' },
    'hanging chains': { top: '15%', left: '40%', width: '150px', height: '120px' },
    'torch': { top: '30%', left: '70%', width: '80px', height: '100px' }
  },
};

// Lists for creating memorable prompts
const ACTION_VERBS = [
  'on',
  'next to',
  'inside',
  'above',
  'below',
  'behind',
  'in front of',
  'around'
];

const DESCRIPTIVE_ADJECTIVES = [
  'giant', 'tiny', 'glowing', 'colorful',
  'transparent', 'bright', 'sparkling', 'floating'
];

const ART_STYLES = [
  'digital art',
  'realistic',
  'detailed illustration',
  'high quality render'
];

// Helper function to determine if a term needs figurative representation
const needsFigurativeRepresentation = (term) => {
  // Convert to lowercase for processing
  const lowerTerm = term.toLowerCase();

  // Categories that typically benefit from figurative representation

  // 1. Proper nouns (names, places, etc.)
  const properNouns = ['washington', 'adams', 'jefferson', 'madison', 'monroe',
                       'jackson', 'van buren', 'harrison', 'tyler', 'america',
                       'europe', 'africa', 'asia'];

  // 2. Abstract concepts
  const abstractConcepts = ['freedom', 'love', 'time', 'money', 'justice', 'peace',
                           'happiness', 'sadness', 'anger', 'fear', 'courage',
                           'wisdom', 'knowledge', 'truth', 'beauty', 'democracy'];

  // 3. Complex or technical terms
  const complexTerms = ['photosynthesis', 'democracy', 'philosophy', 'psychology',
                       'mathematics', 'algorithm', 'quantum', 'relativity',
                       'economics', 'infrastructure'];

  // 4. Numbers and dates
  const isNumberOrDate = /\d+/.test(lowerTerm);

  // 5. Multi-word phrases (likely to be complex concepts)
  const isMultiWord = term.includes(' ');

  // 6. Long words (often complex and benefit from breakdown)
  const isLongWord = term.length > 6;

  // Check if the term falls into any of these categories
  if (properNouns.some(noun => lowerTerm.includes(noun)) ||
      abstractConcepts.some(concept => lowerTerm.includes(concept)) ||
      complexTerms.some(term => lowerTerm.includes(term)) ||
      isNumberOrDate ||
      isMultiWord ||
      isLongWord) {
    return true;
  }

  // Categories that are typically better with literal representation

  // 1. Common concrete nouns (everyday objects)
  const concreteNouns = ['apple', 'chair', 'table', 'dog', 'cat', 'house', 'car',
                         'tree', 'flower', 'book', 'pen', 'phone', 'computer',
                         'water', 'food', 'shirt', 'shoe'];

  // 2. Simple adjectives
  const simpleAdjectives = ['red', 'blue', 'green', 'big', 'small', 'hot', 'cold',
                           'fast', 'slow', 'happy', 'sad', 'good', 'bad'];

  // Check if the term is a concrete noun or simple adjective
  if (concreteNouns.some(noun => lowerTerm === noun) ||
      simpleAdjectives.some(adj => lowerTerm === adj)) {
    return false;
  }

  // Default to figurative for anything not explicitly categorized
  return true;
};

const VisualizerPage = ({ associations, roomType }) => {
  const [selectedAssociation, setSelectedAssociation] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0, transform: null });
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [imageCache, setImageCache] = useState({});

  // Get the current room type from props or localStorage
  const currentRoomType = roomType || localStorage.getItem('roomType') || 'throne room';

  // Get the appropriate room image
  const roomImage = ROOM_IMAGES[currentRoomType] || ROOM_IMAGES["throne room"];

  // Get the appropriate anchor positions for this room
  const anchorPositions = ROOM_ANCHOR_POSITIONS[currentRoomType] || ROOM_ANCHOR_POSITIONS["throne room"];

  // Get associations from props or localStorage
  const storedAssociations = associations?.length > 0 ? associations :
      JSON.parse(localStorage.getItem('associations') || '[]');

  console.log('Using associations:', storedAssociations);
  console.log('Current room type:', currentRoomType);

  const generateFigurativeAssociation = (memorable) => {
    // Convert to lowercase for processing
    const term = memorable.toLowerCase().trim();

    // Common phonetic patterns - fix exact matching
    const phonetics = [
      { pattern: 'washington', replacement: 'a person washing a weight labeled "ton"' },
      { pattern: 'adams', replacement: 'a man wearing a fig leaf (like Adam)' },
      { pattern: 'jefferson', replacement: 'a jar of "Jef" peanut butter' },
      { pattern: 'madison', replacement: 'a mad-looking sun' },
      { pattern: 'monroe', replacement: 'Marilyn Monroe' },
      { pattern: 'jackson', replacement: 'jack playing cards' },
      { pattern: 'van buren', replacement: 'a toy van driving into a small bureau' },
      { pattern: 'harrison', replacement: 'a hairy baby in a small son' },
      { pattern: 'tyler', replacement: 'a person laying tiles' },

      // Common word patterns
      { pattern: 'phone', replacement: 'a foam finger pointing' },
      { pattern: 'cat', replacement: 'a feline' },
      { pattern: 'dog', replacement: 'a canine' },
      { pattern: 'school', replacement: 'a building with a bell and students' },
      { pattern: 'car', replacement: 'an automobile' },
      { pattern: 'book', replacement: 'pages bound together' },
      { pattern: 'key', replacement: 'a metal object that opens locks' },

      // Numbers and dates
      { pattern: '1776', replacement: 'the number 17 next to the number 76' },
      { pattern: '2000', replacement: 'the number 2 followed by three zeros' },

      // Abstract concepts
      { pattern: 'freedom', replacement: 'broken chains' },
      { pattern: 'love', replacement: 'a heart symbol' },
      { pattern: 'time', replacement: 'a clock with animated hands' },
      { pattern: 'money', replacement: 'dollar bills and coins' },

      // Common syllables for creative breakdown
      { pattern: 'ing', replacement: 'a ring with the letter I inside it' },
      { pattern: 'er', replacement: 'the letters E and R' },
      { pattern: 'tion', replacement: 'a weight labeled "ton"' },
      { pattern: 'pre', replacement: 'the letter P followed by "re"' },
      { pattern: 'con', replacement: 'a con artist' },
      { pattern: 'ex', replacement: 'a large X' },
      { pattern: 'pro', replacement: 'a thumbs up sign' },
      { pattern: 'un', replacement: 'the letter U next to letter N' },
    ];

    // Check for exact matches first
    for (const { pattern, replacement } of phonetics) {
      if (term === pattern) {
        console.log(`Exact match found for "${term}": ${replacement}`);
        return replacement;
      }
    }

    // Then check for partial matches
    for (const { pattern, replacement } of phonetics) {
      if (term.includes(pattern)) {
        console.log(`Partial match found for "${term}": ${replacement}`);
        return replacement;
      }
    }

    // If no direct match, try to create a figurative description based on word length
    if (term.length > 6) {
      const firstHalf = term.substring(0, Math.ceil(term.length / 2));
      const secondHalf = term.substring(Math.ceil(term.lenth / 2));

      return `a visual combination of "${firstHalf}" and "${secondHalf}", possibly ${firstHalf} interacting with ${secondHalf}`;
    }

    // Fallback for words we don't have a specific pattern for
    return `a creative, visual representation of "${memorable}"`;
  };

  const generatePrompt = (association) => {
    // Randomly select elements to create variety
    const verb = ACTION_VERBS[Math.floor(Math.random() * ACTION_VERBS.length)];
    const adjective = DESCRIPTIVE_ADJECTIVES[Math.floor(Math.random() * DESCRIPTIVE_ADJECTIVES.length)];
    const artStyle = ART_STYLES[Math.floor(Math.random() * ART_STYLES.length)];

    // Determine if we should use figurative or literal approach
    const shouldUseFigurative = needsFigurativeRepresentation(association.memorable);

    let description;
    if (shouldUseFigurative) {
      // Use figurative approach
      description = generateFigurativeAssociation(association.memorable);
    } else {
      // Use literal approach
      description = `a ${adjective} ${association.memorable}`;
    }

    // Create the prompt
    const prompt = `${description} ${verb} a ${association.anchor}, ${artStyle}.`;

    // Save a simplified version for display (without art style)
    const displayPrompt = `${description} ${verb} a ${association.anchor}.`;
    setCurrentPrompt(displayPrompt);

    return prompt;
  };


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

    // Check if we already have a cached image for this association
    const cacheKey = `${association.anchor}-${association.memorable}`;
    if (imageCache[cacheKey]) {
      console.log('Using cached image for:', cacheKey);
      setGeneratedImage(imageCache[cacheKey].imageUrl);
      setCurrentPrompt(imageCache[cacheKey].prompt);
      return; // Exit early, no need to generate a new image
    }

    // If no cached image, proceed with generation
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setCurrentPrompt('');

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

        // Cache the generated image
        setImageCache(prevCache => ({
          ...prevCache,
          [cacheKey]: { imageUrl, prompt: currentPrompt }
        }));
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

        {storedAssociations.map((assoc, index) => {
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

            {currentPrompt && !isLoading && generatedImage && (
              <div className="text-xs text-gray-600 italic mb-2 bg-gray-100 p-2 rounded">
                {currentPrompt}
              </div>
            )}

            {isLoading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-secondary">Creating your memorable image...</p>
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
