const express = require('express');
const { generateImages } = require('../controllers/imageController');
const router = express.Router();

router.post('/generate-images', generateImages);

module.exports = router;
