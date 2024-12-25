const express = require('express');
const { generateImages } = require('../controllers/imageController');
const router = express.Router();

console.log('generateImages:', generateImages); // Add this line to check if the function is defined

router.post('/generate-images', generateImages);

module.exports = router;
