import { SecureAPIClient, InputSanitizer } from '../utils/security';
import { generatePrompt } from '../utils/promptGenerator';

// Initialize secure API client
const apiClient = new SecureAPIClient('http://localhost:5001');

// Cache for storing generated images
let imageCache = {};

/**
 * Generates an image based on the provided association
 * @param {Object} association - The association object containing anchor and memorable
 * @returns {Promise} - Promise resolving to the image data
 */
export const generateImage = async (association, setCurrentPrompt) => {
  try {
    // Sanitize input
    const sanitizedAssociation = InputSanitizer.sanitizeObject(association);

    // Ensure we have the required data
    if (!sanitizedAssociation || !sanitizedAssociation.memorableItem) {
      const error = new Error('Invalid association data: missing memorable item');
      error.response = { status: 400 };
      throw error;
    }

    // Generate the prompt
    const promptResult = await generatePrompt(sanitizedAssociation, setCurrentPrompt);

    // Check if prompt generation was successful
    if (!promptResult || !promptResult.fullPrompt) {
      console.error('Failed to generate prompt:', promptResult);
      // Use a fallback prompt
      const fallbackPrompt = `a ${sanitizedAssociation.memorableItem} near a ${sanitizedAssociation.anchor}, digital art`;
      console.log('Using fallback prompt:', fallbackPrompt);

      if (setCurrentPrompt) {
        setCurrentPrompt(fallbackPrompt);
      }

      // Make API request with fallback prompt
      const response = await apiClient.post('/api/generate-images', {
        prompt: fallbackPrompt,
        association: sanitizedAssociation
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.error || 'Failed to generate image');
        error.response = { status: response.status, data: errorData };
        throw error;
      }

      const data = await response.json();
      console.log('Backend image generation response:', data);
      return data;
    }

    console.log('Sending prompt to API:', promptResult.fullPrompt);

    // Make API request with generated prompt
    const response = await apiClient.post('/api/generate-images', {
      prompt: promptResult.fullPrompt,
      association: sanitizedAssociation
    });

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

    // Enhance the error with context if it doesn't have response data
    if (!error.response) {
      error.context = 'image-generation';
    }

    throw error;
  }
};

/**
 * Clears the image cache
 */
export const clearImageCache = () => {
  imageCache = {};
};
