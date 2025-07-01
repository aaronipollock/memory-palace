// Frontend Security Utilities

// Token management
class TokenManager {
  static getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  static setAccessToken(token) {
    localStorage.setItem('accessToken', token);
  }

  static removeAccessToken() {
    localStorage.removeItem('accessToken');
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

// CSRF Protection
class CSRFProtection {
  static getCSRFToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
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
    TokenManager.removeAccessToken();
    localStorage.removeItem('token'); // Legacy token
    window.location.href = '/login';
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

// Password strength validation (MVP-friendly)
class PasswordValidator {
  static validate(password) {
    const errors = [];

    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength: this.calculateStrength(password)
    };
  }

  static calculateStrength(password) {
    let score = 0;

    // Length
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Character variety
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[@$!%*?&]/.test(password)) score += 1;

    // Bonus for mixed case and numbers
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password) && /[a-zA-Z]/.test(password)) score += 1;

    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    if (score <= 6) return 'strong';
    return 'very-strong';
  }
}

// Rate limiting for client-side operations
class ClientRateLimiter {
  constructor() {
    this.attempts = new Map();
  }

  canAttempt(key, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    // Remove old attempts outside the window
    const validAttempts = attempts.filter(timestamp => now - timestamp < windowMs);

    if (validAttempts.length >= maxAttempts) {
      return false;
    }

    // Add current attempt
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);

    return true;
  }

  reset(key) {
    this.attempts.delete(key);
  }
}

// Export security utilities
export {
  TokenManager,
  CSRFProtection,
  SecureAPIClient,
  InputSanitizer,
  PasswordValidator,
  ClientRateLimiter
};
