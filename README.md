# Low·sai

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

Low·sai is an AI-powered learning platform that helps users memorize information by creating visual memory palaces with AI-generated imagery. The application combines the ancient memory technique of the "method of loci" with modern AI technology to create personalized, memorable learning experiences.

## Live Site

🌐 **Production Application**: [https://low-sai.com](https://low-sai.com)

## Features

### Memory Palace Creation
- Create personalized memory palaces with custom room layouts
- Generate AI-powered images for memorable items using Stability AI
- Save and manage multiple memory palaces
- Interactive visualizer with drag-and-drop functionality

### User Authentication
- Secure JWT-based authentication with CSRF protection
- Demo account for immediate testing
- Session management with automatic token refresh
- Password strength validation

### Image Generation & Management
- AI-powered image generation using Stability AI API
- Base64 image handling and file storage
- Image optimization and lazy loading
- Support for large image payloads (up to 50MB)

### User Experience
- Responsive design for all device types
- HashRouter for seamless navigation
- Real-time feedback and error handling
- Toast notifications for user actions

## Technologies Used

### Frontend
- **React.js** - Component-based UI framework
- **JavaScript** - Core programming language
- **Tailwind CSS** - Utility-first CSS framework
- **HashRouter** - Client-side routing
- **Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication

### AI & External Services
- **Stability AI API** - Image generation
- **MongoDB Atlas** - Cloud database hosting
- **Render** - Application hosting platform

### Security & Performance
- **CSRF Protection** - Cross-site request forgery prevention
- **Rate Limiting** - API request throttling
- **Input Validation** - Data sanitization
- **Image Optimization** - Performance enhancement

## Database Schema

The application uses MongoDB with the following collections:

### Users
```javascript
{
  email: String,
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Memory Palaces
```javascript
{
  userId: ObjectId,
  title: String,
  description: String,
  rooms: [{
    name: String,
    items: [{
      name: String,
      image: String,
      position: { x: Number, y: Number }
    }]
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

### Memory Palace Endpoints
- `GET /api/memory-palaces` - Get user's memory palaces
- `POST /api/memory-palaces` - Create new memory palace
- `GET /api/memory-palaces/:id` - Get specific memory palace
- `PUT /api/memory-palaces/:id` - Update memory palace
- `DELETE /api/memory-palaces/:id` - Delete memory palace

### Image Generation Endpoints
- `POST /api/images/generate` - Generate AI image
- `GET /api/images/user/:filename` - Serve user-generated images

### Feedback Endpoints
- `POST /api/feedback` - Submit user feedback

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Stability AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aaronipollock/memory-palace.git
   cd memory-palace
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**

   Create a `.env` file in the `server` directory:
   ```env
   NODE_ENV=development
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   STABILITY_API_KEY=your_stability_ai_api_key
   PORT=5001
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password
   FEEDBACK_EMAIL=feedback@example.com
   ```

4. **Database Setup**
   ```bash
   cd server
   node scripts/loadSeedData.js
   ```

5. **Start Development Servers**
   ```bash
   # Start backend server (from server directory)
   npm start

   # Start frontend development server (from client directory)
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## Demo Account

For immediate testing, use the demo account:
- **Email**: demo@example.com
- **Password**: demo123

## Deployment

The application is deployed on Render with the following configuration:

### Frontend (Static Site)
- **Service Type**: Static Site
- **Build Command**: `cd client && npm install && npm run build`
- **Publish Directory**: `client/build`
- **Custom Domain**: low-sai.com

### Backend (Web Service)
- **Service Type**: Web Service
- **Build Command**: `cd server && npm install`
- **Start Command**: `cd server && npm start`
- **Environment Variables**: Configured in Render dashboard

## Project Structure

```
low-sai/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context providers
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   └── config/             # Configuration files
└── docs/                   # Documentation
```

## Future Features

- **User Accounts**: Full user registration and profile management
- **Collaborative Palaces**: Share memory palaces with others
- **Advanced AI**: More sophisticated image generation options
- **Mobile App**: Native mobile application
- **Analytics**: Learning progress tracking
- **Export Options**: PDF and image export functionality

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

This application implements several security measures:
- JWT token authentication with refresh tokens
- CSRF protection for state-changing operations
- Rate limiting to prevent abuse
- Input validation and sanitization
- Secure password hashing with bcrypt
- Environment variable protection

## Privacy & Telemetry

This application respects user privacy and does not collect or send personal data to external services.

- **Privacy Policy**: [PRIVACY_POLICY](PRIVACY_POLICY.md)
- **Privacy & Telemetry**: [PRIVACY_TELEMETRY](PRIVACY_TELEMETRY.md)
- **Cookie Policy**: [COOKIE_POLICY](COOKIE_POLICY.md)

## License

This project is licensed under the Apache License, Version 2.0.

- Full text: [LICENSE](LICENSE.md)
- Notices/attributions: [NOTICE](NOTICE.md)
- Asset licenses: [ASSETS_LICENSES](ASSETS_LICENSES.md)

## Contact

**Aaron Pollock** - [GitHub](https://github.com/aaronipollock) - Project Owner

## Acknowledgments

- **Stability AI** for image generation capabilities
- **Render** for hosting platform
- **MongoDB Atlas** for database hosting
- **Tailwind CSS** for styling framework
- All contributors and testers

---
