// API Configuration
const API_CONFIG = {
  // Use environment variable if available, otherwise fallback to development
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
  
  // API endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      REGISTER: '/api/auth/register',
      VERIFY: '/api/auth/verify'
    },
    MEMORY_PALACE: {
      CREATE: '/api/memory-palace',
      GET_ALL: '/api/memory-palace',
      GET_BY_ID: (id) => `/api/memory-palace/${id}`,
      UPDATE: (id) => `/api/memory-palace/${id}`,
      DELETE: (id) => `/api/memory-palace/${id}`
    },
    IMAGES: {
      GENERATE: '/api/images/generate',
      UPLOAD: '/api/images/upload'
    },
    FEEDBACK: '/api/feedback'
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Export the config
export default API_CONFIG;
