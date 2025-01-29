const express = require('express');
const imageController = require('../controllers/imageController');
const roomController = require('../controllers/roomController');
const router = express.Router();

router.post('/generate-images', imageController.generateImages);
router.post('/generate-room', roomController.generateRoom);

module.exports = router;
