import axios from 'axios';
import { generatePrompt } from '../utils/promptGenerator';

// Cache for storing generated images
let imageCache = {};

/**
 * Generates an image based on the provided association
 * @param {Object} association - The association object containing anchor and memorable
 * @returns {Promise} - Promise resolving to the image data
 */
export const generateImage = async (association, setCurrentPrompt) => {
  try {
    // Ensure we have the required data
    if (!association || !association.memorableItem) {
      throw new Error('Invalid association data: missing memorable item');
    }

    // Generate the prompt
    const promptResult = await generatePrompt(association, setCurrentPrompt);

    // Check if prompt generation was successful
    if (!promptResult || !promptResult.fullPrompt) {
      console.error('Failed to generate prompt:', promptResult);
      // Use a fallback prompt
      const fallbackPrompt = `a ${association.memorableItem} near a ${association.anchor}, digital art`;
      console.log('Using fallback prompt:', fallbackPrompt);

      if (setCurrentPrompt) {
        setCurrentPrompt(fallbackPrompt);
      }

      // Make API request with fallback prompt
      const response = await axios.post('/api/generate-image', {
        prompt: fallbackPrompt,
        association
      });

      return response.data;
    }

    console.log('Sending prompt to API:', promptResult.fullPrompt);

    // Make API request with generated prompt
    const response = await axios.post('/api/generate-image', {
      prompt: promptResult.fullPrompt,
      association
    });

    return response.data;
  } catch (error) {
    console.error('Image generation error:', error);
    throw new Error(`API error (${error.response?.status || 'unknown'}): ${error.response?.data?.error || error.message}`);
  }
};

/**
 * Clears the image cache
 */
export const clearImageCache = () => {
  imageCache = {};
};
