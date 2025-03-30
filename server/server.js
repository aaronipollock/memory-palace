require('dotenv').config();

// Add these debug lines at the top of your server.js
console.log('Current directory:', __dirname);
console.log('Environment variables loaded:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');
console.log('API Key first few characters:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'Not found');

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public'))); // Serve static files

// Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

const roomController = require('./controllers/roomController');
app.post('/api/generate-room', roomController.generateRoom);

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Handle any requests that don't match the ones above
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
