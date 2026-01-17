// Centralized error handling utility
export const getErrorMessage = (error, context = '') => {
  console.error(`Error in ${context}:`, error);

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Network/connection errors
  if (!error.response) {
    const message = error.message || '';
    if (error.code === 'ECONNREFUSED' || message.includes('Network Error')) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }
    if (message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    return error.message || 'Network error occurred. Please try again.';
  }

  const { status, data } = error.response;

  // HTTP status code based errors
  switch (status) {
    case 400:
      return data?.error || data?.message || 'Invalid request. Please check your input and try again.';

    case 401:
      return 'Authentication failed. Please log in again.';

    case 403:
      return 'You do not have permission to perform this action.';

    case 404:
      return 'The requested resource was not found.';

    case 429:
      return 'Too many requests. Please wait a moment and try again.';

    case 500:
      if (data?.error?.message) {
        return `Server error: ${data.error.message}`;
      }
      return 'Server error occurred. Please try again later.';

    case 502:
    case 503:
    case 504:
      return 'Service temporarily unavailable. Please try again later.';

    default:
      return data?.error || data?.message || 'An unexpected error occurred. Please try again.';
  }
};

// Specific error messages for different contexts
export const getContextualErrorMessage = (error, context) => {
  const baseMessage = getErrorMessage(error, context);

  switch (context) {
    case 'image-generation':
      if (error.response?.status === 500) {
        return 'Image generation failed. The AI service may be temporarily unavailable. Please try again in a few minutes.';
      }
      return `Image generation failed: ${baseMessage}`;

    case 'authentication':
      if (error.response?.status === 401) {
        return 'Invalid email or password. Please check your credentials and try again.';
      }
      return `Authentication failed: ${baseMessage}`;

    case 'palace-save':
      return `Failed to save memory palace: ${baseMessage}`;

    case 'palace-load':
      return `Failed to load memory palaces: ${baseMessage}`;

    case 'palace-delete':
      return `Failed to delete memory palace: ${baseMessage}`;

    case 'word-concreteness':
      return 'Unable to check word concreteness. Using default settings.';

    default:
      return baseMessage;
  }
};

// Error types for different scenarios
export const ErrorTypes = {
  NETWORK: 'network',
  AUTHENTICATION: 'authentication',
  VALIDATION: 'validation',
  SERVER: 'server',
  TIMEOUT: 'timeout',
  UNKNOWN: 'unknown'
};

// Get error type for styling
export const getErrorType = (error) => {
  // Handle string errors (from auth failures)
  if (typeof error === 'string') {
    if (error.toLowerCase().includes('invalid') || error.toLowerCase().includes('credential')) {
      return ErrorTypes.AUTHENTICATION;
    }
    return ErrorTypes.UNKNOWN;
  }

  // Handle error objects without response
  if (!error.response) {
    const message = error.message || '';
    if (error.code === 'ECONNREFUSED' || message.includes('Network Error')) {
      return ErrorTypes.NETWORK;
    }
    if (message.includes('timeout')) {
      return ErrorTypes.TIMEOUT;
    }
    return ErrorTypes.NETWORK;
  }

  const { status } = error.response;

  if (status === 401) return ErrorTypes.AUTHENTICATION;
  if (status === 400) return ErrorTypes.VALIDATION;
  if (status >= 500) return ErrorTypes.SERVER;

  return ErrorTypes.UNKNOWN;
};

// Error styling classes
export const getErrorStyling = (errorType) => {
  switch (errorType) {
    case ErrorTypes.NETWORK:
      return 'bg-yellow-100 border-yellow-400 text-yellow-700';
    case ErrorTypes.AUTHENTICATION:
      return 'bg-red-100 border-red-400 text-red-700';
    case ErrorTypes.VALIDATION:
      return 'bg-orange-100 border-orange-400 text-orange-700';
    case ErrorTypes.SERVER:
      return 'bg-red-100 border-red-400 text-red-700';
    case ErrorTypes.TIMEOUT:
      return 'bg-blue-100 border-blue-400 text-blue-700';
    default:
      return 'bg-gray-100 border-gray-400 text-gray-700';
  }
};
