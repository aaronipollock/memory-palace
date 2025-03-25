import axios from 'axios';
import { generatePrompt } from '../utils/promptGenerator';

// Cache for storing generated images
let imageCache = {};

/**
 * Generates an image based on the provided association
 * @param {Object} association - The association object containing anchor and memorable
 * @returns {Promise} - Promise resolving to the image data
 */
export const generateImage = async (association) => {
  // Check cache first
  const cacheKey = `${association.anchor}-${association.memorable}`;
  if (imageCache[cacheKey]) {
    console.log('Using cached image for:', cacheKey);
    return {
      imageUrl: imageCache[cacheKey].imageUrl,
      prompt: imageCache[cacheKey].prompt,
      fromCache: true
    };
  }

  // Generate prompt
  const { fullPrompt, displayPrompt } = generatePrompt(association);
  console.log('Sending prompt to API:', fullPrompt);

  try {
    // Make API request
    const response = await axios.post('http://localhost:5000/api/generate-image', {
      prompt: fullPrompt,
      association
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    // Process response
    if (response.data && response.data.imageUrl) {
      // Fix the URL path if needed
      let imageUrl = response.data.imageUrl;

      // If the URL starts with /public, prepend the server URL
      if (imageUrl.startsWith('/public')) {
        imageUrl = `http://localhost:5000${imageUrl}`;
      }

      // Cache the result
      imageCache[cacheKey] = {
        imageUrl,
        prompt: displayPrompt
      };

      return {
        imageUrl,
        prompt: displayPrompt,
        fromCache: false
      };
    } else {
      throw new Error('No image URL in API response');
    }
  } catch (error) {
    // Format error for easier handling
    let errorMessage = 'Failed to generate image';

    if (error.response) {
      errorMessage = `API error (${error.response.status}): ${error.response.data.message || 'Unknown error'}`;
    } else if (error.request) {
      errorMessage = 'No response from server. Is the backend running?';
    } else {
      errorMessage = `Error: ${error.message}`;
    }

    throw new Error(errorMessage);
  }
};

/**
 * Clears the image cache
 */
export const clearImageCache = () => {
  imageCache = {};
}; 
