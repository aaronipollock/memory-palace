// Frontend Security Utilities

// Token management
class TokenManager {
  static getAccessToken() {
    return localStorage.getItem('token');
  }

  static setAccessToken(token) {
    localStorage.setItem('token', token);
  }

  static removeAccessToken() {
    localStorage.removeItem('token');
  }

  static isTokenExpired(token) {
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  static getTokenPayload(token) {
    if (!token) return null;

    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      return null;
    }
  }
}

// CSRF Token management
class CSRFManager {
  static getCSRFToken() {
    const token = localStorage.getItem('csrfToken');
    return token;
  }

  static setCSRFToken(token) {
    localStorage.setItem('csrfToken', token);
  }

  static removeCSRFToken() {
    localStorage.removeItem('csrfToken');
  }

  static clearAllTokens() {
    TokenManager.removeAccessToken();
    this.removeCSRFToken();
  }
}

// CSRF Protection
class CSRFProtection {
  static getCSRFToken() {
    return CSRFManager.getCSRFToken();
  }

  static addCSRFTokenToHeaders(headers = {}) {
    const token = this.getCSRFToken();
    if (token) {
      headers['X-CSRF-Token'] = token;
    }
    return headers;
  }
}

// Secure API Client
class SecureAPIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.refreshPromise = null;
  }

  // Get default headers with authentication
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add CSRF token
    const csrfToken = CSRFProtection.getCSRFToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    // Add authorization token
    const token = TokenManager.getAccessToken();
    if (token && !TokenManager.isTokenExpired(token)) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Make authenticated request with automatic token refresh
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      credentials: 'include', // Include cookies for CSRF token
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Handle token expiration
      if (response.status === 401) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the request with new token
          config.headers = this.getHeaders();
          return await fetch(url, config);
        } else {
          // Redirect to login
          this.handleAuthFailure();
          return response;
        }
      }

      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Refresh access token using refresh token
  async refreshToken() {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = fetch(`${this.baseURL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(async (response) => {
      if (response.ok) {
        const data = await response.json();
        TokenManager.setAccessToken(data.accessToken);
        // Update CSRF token if provided in refresh response
        if (data.csrfToken) {
          CSRFManager.setCSRFToken(data.csrfToken);
        }
        return true;
      } else {
        return false;
      }
    })
    .catch(() => false)
    .finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  // Handle authentication failure
  handleAuthFailure() {
    CSRFManager.clearAllTokens();
    // Clear token from localStorage
    localStorage.removeItem('token');
    // Redirect to login page - use hash router compatible navigation
    window.location.href = '/#/';
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Input sanitization
class InputSanitizer {
  static sanitizeString(input) {
    if (typeof input !== 'string') return input;

    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  }

  static sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;

    const sanitized = Array.isArray(obj) ? [] : {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}

// Password validation
class PasswordValidator {
  static validate(password) {
    const errors = [];

    if (!password) {
      errors.push('Password is required');
      return { isValid: false, errors };
    }

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export all classes
export {
  TokenManager,
  CSRFManager,
  CSRFProtection,
  SecureAPIClient,
  InputSanitizer,
  PasswordValidator
};
