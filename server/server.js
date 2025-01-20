require('dotenv').config();

// Add these debug lines at the top of your server.js
console.log('Current directory:', __dirname);
console.log('Environment variables loaded:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');
console.log('API Key first few characters:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'Not found');

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
