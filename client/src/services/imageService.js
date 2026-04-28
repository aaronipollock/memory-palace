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
export const generateImage = async ({ association, roomType, artStyle, mode, useLlm }, setCurrentPrompt) => {
  try {
    // Sanitize input
    const sanitizedAssociation = InputSanitizer.sanitizeObject(association);

    // Ensure we have the required data
    if (!sanitizedAssociation || !sanitizedAssociation.memorableItem) {
      const error = new Error('Invalid association data: missing memorable item');
      error.response = { status: 400 };
      throw error;
    }

    // Server-first: let backend do Step A (LLM) then Step B (image model).
    // If that fails, fall back to client-side prompt generation and retry with useLlm:false.
    let response;
    try {
      response = await apiClient.post('/api/generate-images', {
        association: sanitizedAssociation,
        roomType,
        artStyle,
        mode,
        useLlm
      });
    } catch (e) {
      response = null;
    }

    if (!response || !response.ok) {
      const promptResult = await generatePrompt(sanitizedAssociation, setCurrentPrompt);
      const fallbackPrompt =
        promptResult?.fullPrompt ||
        `a ${sanitizedAssociation.memorableItem} near a ${sanitizedAssociation.anchor}, digital art`;

      if (setCurrentPrompt) setCurrentPrompt(fallbackPrompt);

      const retry = await apiClient.post('/api/generate-images', {
        prompt: fallbackPrompt,
        association: sanitizedAssociation,
        roomType,
        artStyle,
        mode,
        useLlm: false
      });

      if (!retry.ok) {
        const errorData = await retry.json();
        const error = new Error(errorData.error || 'Failed to generate image');
        error.response = { status: retry.status, data: errorData };
        throw error;
      }

      return await retry.json();
    }

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
export const generateStrangerImage = async ({ association, roomType, artStyle, mode, useLlm }, setCurrentPrompt) => {
  try {
    // Sanitize input
    const sanitizedAssociation = InputSanitizer.sanitizeObject(association);

    // Ensure we have the required data
    if (!sanitizedAssociation || !sanitizedAssociation.memorableItem) {
      const error = new Error('Invalid association data: missing memorable item');
      error.response = { status: 400 };
      throw error;
    }

    let response;
    try {
      response = await apiClient.post('/api/generate-images', {
        association: sanitizedAssociation,
        roomType,
        artStyle,
        mode,
        useLlm
      });
    } catch (e) {
      response = null;
    }

    if (!response || !response.ok) {
      const promptResult = await generateStrangerPrompt(sanitizedAssociation, setCurrentPrompt);
      const fallbackPrompt =
        promptResult?.fullPrompt ||
        `a surreal, bizarre scene of ${sanitizedAssociation.memorableItem} interacting with a ${sanitizedAssociation.anchor}`;

      if (setCurrentPrompt) setCurrentPrompt(fallbackPrompt);

      const retry = await apiClient.post('/api/generate-images', {
        prompt: fallbackPrompt,
        association: sanitizedAssociation,
        roomType,
        artStyle,
        mode,
        useLlm: false
      });

      if (!retry.ok) {
        const errorData = await retry.json();
        const error = new Error(errorData.error || 'Failed to generate stranger image');
        error.response = { status: retry.status, data: errorData };
        throw error;
      }

      return await retry.json();
    }

    return await response.json();
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
