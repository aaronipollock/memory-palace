# Memory Palace API Documentation

## Overview

The Low·sAI API is a RESTful service that enables users to create, manage, and interact with AI-powered memory palaces. The API provides endpoints for authentication, image generation, room creation, and memory palace management.

**Base URL:** `http://localhost:5001` (Development)
**API Version:** v1
**Content Type:** `application/json`

## Table of Contents

1. [Authentication](#authentication)
2. [Memory Palaces](#memory-palaces)
3. [Custom Rooms](#custom-rooms)
4. [Image Generation](#image-generation)
5. [Room Generation](#room-generation)
6. [Utility Endpoints](#utility-endpoints)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)
9. [Security](#security)

---

## Authentication

The API uses JWT (JSON Web Tokens) for authentication with refresh token support.

### Authentication Flow

1. **Signup/Login** → Receive access token and refresh token
2. **Include access token** in `Authorization` header for protected endpoints
3. **Refresh token** automatically when access token expires
4. **Logout** to invalidate tokens

### Headers

```http
Authorization: Bearer <access_token>
X-CSRF-Token: <csrf_token>  # Required for POST/PUT/DELETE requests
Content-Type: application/json
```

---

### POST /api/auth/signup

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "message": "User created successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "csrfToken": "abc123...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com"
  }
}
```

**Error Responses:**
- `400` - User already exists
- `400` - Validation errors
- `500` - Server error

---

### POST /api/auth/login

Authenticate existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "csrfToken": "abc123...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com"
  }
}
```

**Error Responses:**
- `401` - Invalid credentials
- `400` - Validation errors
- `500` - Server error

---

### POST /api/auth/refresh

Refresh access token using refresh token.

**Request:** No body required (uses HTTP-only cookie)

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Token refreshed successfully"
}
```

**Error Responses:**
- `401` - Missing or invalid refresh token

---

### POST /api/auth/logout

Logout current session.

**Request:** No body required

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

### POST /api/auth/logout-all

Logout all sessions for the user.

**Request:** No body required

**Response (200 OK):**
```json
{
  "message": "All sessions logged out successfully"
}
```

---

## Memory Palaces

Endpoints for managing memory palaces.

### GET /api/memory-palaces

Get all memory palaces for the authenticated user.

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "My First Palace",
    "roomType": "throne room",
    "associations": [
      {
        "anchor": "throne",
        "memorableItem": "apple",
        "imageUrl": "http://localhost:5001/images/optimized/1234567890-throne-apple.png"
      }
    ],
    "userId": "507f1f77bcf86cd799439012",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Server error

---

### GET /api/memory-palaces/:id

Get a specific memory palace by ID.

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "My First Palace",
  "roomType": "throne room",
  "associations": [
    {
      "anchor": "throne",
      "memorableItem": "apple",
      "imageUrl": "http://localhost:5001/images/optimized/1234567890-throne-apple.png"
    }
  ],
  "userId": "507f1f77bcf86cd799439012",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `401` - Unauthorized
- `403` - Access denied
- `404` - Memory palace not found
- `500` - Server error

---

### POST /api/memory-palaces

Create a new memory palace.

**Headers:**
```http
Authorization: Bearer <access_token>
X-CSRF-Token: <csrf_token>
```

**Request Body:**
```json
{
  "name": "My New Palace",
  "roomType": "throne room",
  "associations": [
    {
      "anchor": "throne",
      "memorableItem": "apple",
      "imageUrl": "http://localhost:5001/images/optimized/1234567890-throne-apple.png"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "My New Palace",
  "roomType": "throne room",
  "associations": [
    {
      "anchor": "throne",
      "memorableItem": "apple",
      "imageUrl": "http://localhost:5001/images/optimized/1234567890-throne-apple.png"
    }
  ],
  "userId": "507f1f77bcf86cd799439012",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `401` - Unauthorized
- `400` - Validation errors
- `500` - Server error

---

## Custom Rooms

Endpoints for managing user-uploaded custom room images with anchor points.

### GET /api/custom-rooms

Get all custom rooms for the authenticated user.

**Headers:**
```http
Authorization: Bearer <access_token>
X-CSRF-Token: <csrf_token>
```

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "My Living Room",
    "description": "A cozy living room space",
    "roomType": "custom",
    "userId": "507f1f77bcf86cd799439012",
    "imageUrl": "https://example.com/room.jpg",
    "anchorPoints": [
      {
        "name": "Sofa",
        "x": 100,
        "y": 200,
        "description": "Main seating area"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Server error

---

### GET /api/custom-rooms/:id

Get a specific custom room by ID.

**Headers:**
```http
Authorization: Bearer <access_token>
X-CSRF-Token: <csrf_token>
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "My Living Room",
  "description": "A cozy living room space",
  "roomType": "custom",
  "userId": "507f1f77bcf86cd799439012",
  "imageUrl": "https://example.com/room.jpg",
  "anchorPoints": [...],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400` - Invalid room ID format
- `401` - Unauthorized
- `403` - Access denied (room belongs to another user)
- `404` - Custom room not found
- `500` - Server error

---

### POST /api/custom-rooms

Create a new custom room.

**Headers:**
```http
Authorization: Bearer <access_token>
X-CSRF-Token: <csrf_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "My Living Room",
  "description": "A cozy living room space",
  "imageUrl": "https://example.com/room.jpg",
  "anchorPoints": [
    {
      "name": "Sofa",
      "x": 100,
      "y": 200,
      "description": "Main seating area"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "My Living Room",
  "description": "A cozy living room space",
  "roomType": "custom",
  "userId": "507f1f77bcf86cd799439012",
  "imageUrl": "https://example.com/room.jpg",
  "anchorPoints": [...],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400` - Validation errors (missing name, invalid anchor points, etc.)
- `401` - Unauthorized
- `500` - Server error

---

### PUT /api/custom-rooms/:id

Update an existing custom room (e.g., add or modify anchor points).

**Headers:**
```http
Authorization: Bearer <access_token>
X-CSRF-Token: <csrf_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Room Name",
  "description": "Updated description",
  "anchorPoints": [
    {
      "name": "Sofa",
      "x": 100,
      "y": 200,
      "description": "Main seating area"
    },
    {
      "name": "TV",
      "x": 300,
      "y": 150,
      "description": "Entertainment center"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Updated Room Name",
  "description": "Updated description",
  "roomType": "custom",
  "userId": "507f1f77bcf86cd799439012",
  "imageUrl": "https://example.com/room.jpg",
  "anchorPoints": [...],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

**Error Responses:**
- `400` - Validation errors or invalid room ID format
- `401` - Unauthorized
- `403` - Access denied (room belongs to another user)
- `404` - Custom room not found
- `500` - Server error

---

### DELETE /api/custom-rooms/:id

Delete a custom room.

**Headers:**
```http
Authorization: Bearer <access_token>
X-CSRF-Token: <csrf_token>
```

**Response (200 OK):**
```json
{
  "message": "Custom room deleted successfully"
}
```

**Error Responses:**
- `400` - Invalid room ID format
- `401` - Unauthorized
- `403` - Access denied (room belongs to another user)
- `404` - Custom room not found
- `500` - Server error

---

## Image Generation

Endpoints for generating AI-powered images.

### POST /api/generate-images

Generate an image using Stability AI.

**Headers:**
```http
Authorization: Bearer <access_token>
X-CSRF-Token: <csrf_token>
```

**Request Body:**
```json
{
  "prompt": "A realistic image of an apple sitting on a golden throne",
  "association": {
    "anchor": "throne",
    "memorableItem": "apple"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "imageData": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "mimeType": "image/png",
  "filename": "1234567890-throne-apple.png"
}
```

**Error Responses:**
- `400` - Invalid request
- `500` - Image generation failed

---

### POST /api/upload-image

Upload and optimize an existing image.

**Headers:**
```http
Authorization: Bearer <access_token>
X-CSRF-Token: <csrf_token>
Content-Type: multipart/form-data
```

**Request Body:** Form data with image file

**Response (200 OK):**
```json
{
  "success": true,
  "originalUrl": "http://localhost:5001/images/original/uploaded-image.png",
  "optimizedUrl": "http://localhost:5001/images/optimized/uploaded-image.png",
  "optimizationSuccess": true,
  "filename": "uploaded-image.png"
}
```

**Error Responses:**
- `400` - No file uploaded
- `500` - Upload failed

---

### GET /api/image-info/:filename

Get information about a specific image.

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "originalExists": true,
  "optimizedExists": true,
  "originalUrl": "http://localhost:5001/images/original/image.png",
  "optimizedUrl": "http://localhost:5001/images/optimized/image.png"
}
```

---

## Room Generation

Endpoints for generating room layouts.

### POST /api/generate-room

Generate a room layout using OpenAI DALL-E.

**Headers:**
```http
Authorization: Bearer <access_token>
X-CSRF-Token: <csrf_token>
```

**Request Body:**
```json
{
  "roomType": "throne room",
  "anchorPoints": ["throne", "candlestick", "red carpet"]
}
```

**Response (200 OK):**
```json
{
  "roomImage": "https://oaidalleapiprodscus.blob.core.windows.net/private/...",
  "positions": [
    {
      "name": "throne",
      "x": 400,
      "y": 200
    },
    {
      "name": "candlestick",
      "x": 400,
      "y": 300
    },
    {
      "name": "red carpet",
      "x": 400,
      "y": 400
    }
  ],
  "prompt": "A clear, eye-level view of a throne room..."
}
```

**Error Responses:**
- `400` - Invalid request
- `500` - Room generation failed

---

## Utility Endpoints

### GET /api/word-concreteness/:word

Check if a word is concrete or abstract.

**Response (200 OK):**
```json
{
  "isConcrete": true
}
```

**Example:**
```bash
GET /api/word-concreteness/apple
# Returns: {"isConcrete": true}

GET /api/word-concreteness/freedom
# Returns: {"isConcrete": false}
```

---

### GET /api/similar-words/:word

Find similar words from a list of candidates.

**Query Parameters:**
- `candidates` (required): Comma-separated list of candidate words
- `count` (optional): Number of similar words to return (default: 5)

**Response (200 OK):**
```json
{
  "similarWords": ["apple", "orange", "banana"]
}
```

**Example:**
```bash
GET /api/similar-words/fruit?candidates=apple,car,house,orange&count=3
```

---

### GET /api/figurative-association/:term

Generate a figurative association for a term.

**Response (200 OK):**
```json
{
  "association": "A bright light bulb representing the concept of ideas"
}
```

**Example:**
```bash
GET /api/figurative-association/creativity
```

---

## Error Handling

All API endpoints return consistent error responses.

### Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional details (development only)"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `INVALID_CREDENTIALS` | Wrong email/password |
| `USER_EXISTS` | User already registered |
| `MISSING_REFRESH_TOKEN` | No refresh token provided |
| `INVALID_REFRESH_TOKEN` | Invalid or expired refresh token |
| `ACCESS_DENIED` | User doesn't have permission |
| `VALIDATION_ERROR` | Request validation failed |
| `INTERNAL_ERROR` | Server error |

### HTTP Status Codes

| Status | Description |
|--------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Not Found |
| `429` | Too Many Requests |
| `500` | Internal Server Error |

---

## Rate Limiting

The API implements rate limiting to prevent abuse.

### Rate Limits

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| General requests | 200 requests | 15 minutes |
| Authentication | 15 attempts | 15 minutes |
| Image generation | 30 requests | 1 hour |

### Rate Limit Response

When rate limited, the API returns:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 900
```

```json
{
  "error": "Too many requests, please try again later.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

---

## Security

### Authentication

- **JWT Tokens**: Access tokens expire in 15 minutes (production) or 1 hour (development)
- **Refresh Tokens**: Valid for 7 days, stored as HTTP-only cookies
- **CSRF Protection**: Required for state-changing operations

### Security Headers

The API includes security headers via Helmet.js:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Input Validation

- All inputs are validated and sanitized
- XSS protection enabled
- SQL injection prevention
- File upload validation

### CORS

Configured for specific origins:
- Development: `http://localhost:3000`
- Production: Configured via environment variables

---

## Environment Variables

Required environment variables for the API:

```bash
# Server Configuration
PORT=5001
NODE_ENV=development

# Database
MONGODB_URI=<your_mongodb_connection_string>

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# API Keys
STABILITY_API_KEY=your-stability-api-key

# Security
FRONTEND_URL=http://localhost:3000
COOKIE_DOMAIN=localhost

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=200
AUTH_RATE_LIMIT_MAX_REQUESTS=15
IMAGE_GEN_RATE_LIMIT_MAX_REQUESTS=30
```

---

## SDK Examples

### JavaScript/Node.js

```javascript
class MemoryPalaceAPI {
  constructor(baseURL = 'http://localhost:5001') {
    this.baseURL = baseURL;
    this.accessToken = null;
    this.csrfToken = null;
  }

  async login(email, password) {
    const response = await fetch(`${this.baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    this.accessToken = data.accessToken;
    this.csrfToken = data.csrfToken;
    return data;
  }

  async generateImage(prompt, association) {
    const response = await fetch(`${this.baseURL}/api/generate-images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
        'X-CSRF-Token': this.csrfToken
      },
      body: JSON.stringify({ prompt, association })
    });

    return response.json();
  }
}

// Usage
const api = new MemoryPalaceAPI();
await api.login('user@example.com', 'password');
const image = await api.generateImage('An apple on a throne', {
  anchor: 'throne',
  memorableItem: 'apple'
});
```

### Python

```python
import requests

class MemoryPalaceAPI:
    def __init__(self, base_url='http://localhost:5001'):
        self.base_url = base_url
        self.access_token = None
        self.csrf_token = None

    def login(self, email, password):
        response = requests.post(f'{self.base_url}/api/auth/login', json={
            'email': email,
            'password': password
        })
        data = response.json()
        self.access_token = data['accessToken']
        self.csrf_token = data['csrfToken']
        return data

    def generate_image(self, prompt, association):
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'X-CSRF-Token': self.csrf_token
        }
        response = requests.post(f'{self.base_url}/api/generate-images',
                               json={'prompt': prompt, 'association': association},
                               headers=headers)
        return response.json()

# Usage
api = MemoryPalaceAPI()
api.login('user@example.com', 'password')
image = api.generate_image('An apple on a throne', {
    'anchor': 'throne',
    'memorableItem': 'apple'
})
```

---

## Support

For API support and questions:

- **Documentation**: This document
- **Issues**: Check the project repository
- **Security**: Report security issues privately

---

*Last updated: January 2024*
