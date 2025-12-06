// Debug: Log environment variables (only in development)
if (import.meta.env.MODE === 'development') {
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('MODE:', import.meta.env.MODE);
}

// Use environment variable if available, otherwise fallback to development
// Vite uses import.meta.env instead of process.env
// In production, default to the Render API URL if env var is missing
let BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'production'
    ? 'https://memory-palace-api.onrender.com'
    : 'http://localhost:5001');

// Ensure we never use the frontend URL as the API URL
if (BASE_URL && (BASE_URL.includes('memory-palace-frontend') || BASE_URL.includes('low-sai.com'))) {
  console.error('ERROR: API URL is set to frontend URL! Using fallback.');
  BASE_URL = 'https://memory-palace-api.onrender.com';
  console.log('Using fallback API URL:', BASE_URL);
}

const API_CONFIG = {
  BASE_URL: BASE_URL,
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

export default API_CONFIG;
