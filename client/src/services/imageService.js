import { SecureAPIClient, InputSanitizer } from '../utils/security';
import { generatePrompt, generateStrangerPrompt } from '../utils/promptGenerator';

// Initialize secure API client
import { getApiUrl } from '../config/api';
const apiClient = new SecureAPIClient(getApiUrl(''));

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
      return data;
    }

    // Make API request with generated prompt
    console.log('Making API request to /api/generate-images with prompt:', promptResult.fullPrompt);
    const response = await apiClient.post('/api/generate-images', {
      prompt: promptResult.fullPrompt,
      association: sanitizedAssociation
    });

    console.log('API response status:', response.status, response.statusText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      console.error('Image generation API error:', errorData);
      const error = new Error(errorData.error || 'Failed to generate image');
      error.response = { status: response.status, data: errorData };
      throw error;
    }

    const data = await response.json();
    console.log('Image generation successful:', {
      hasImageData: !!data.imageData,
      hasOptimizedUrl: !!data.optimizedUrl,
      hasImageUrl: !!data.imageUrl,
      isPlaceholder: data.isPlaceholder
    });
    return data;
  } catch (error) {
    console.error('Image generation error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data,
      context: error.context
    });

    // Enhance the error with context if it doesn't have response data
    if (!error.response) {
      error.context = 'image-generation';
    }

    throw error;
  }
};

/**
 * Generates a STRANGER version of an image (for "Make it Stranger" button)
 * Uses more extreme prompts to create more memorable, bizarre images
 */
export const generateStrangerImage = async (association, setCurrentPrompt) => {
  try {
    // Sanitize input
    const sanitizedAssociation = InputSanitizer.sanitizeObject(association);

    // Ensure we have the required data
    if (!sanitizedAssociation || !sanitizedAssociation.memorableItem) {
      const error = new Error('Invalid association data: missing memorable item');
      error.response = { status: 400 };
      throw error;
    }

    // Generate the stranger prompt
    const promptResult = await generateStrangerPrompt(sanitizedAssociation, setCurrentPrompt);

    if (!promptResult || !promptResult.fullPrompt) {
      console.error('Failed to generate stranger prompt:', promptResult);
      // Fallback to regular prompt if stranger prompt fails
      return generateImage(association, setCurrentPrompt);
    }

    // Make API request with stranger prompt
    const response = await apiClient.post('/api/generate-images', {
      prompt: promptResult.fullPrompt,
      association: sanitizedAssociation
    });

    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(errorData.error || 'Failed to generate stranger image');
      error.response = { status: response.status, data: errorData };
      throw error;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Stranger image generation error:', error);

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
