const express = require('express');
const router = express.Router();
const customRoomController = require('../controllers/customRoomController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
// This ensures only logged-in users can access these endpoints
router.use(authenticateToken);

// GET all custom rooms for the authenticated user
// Route: GET /api/custom-rooms
router.get('/', customRoomController.getCustomRooms);

// DELETE all custom rooms for demo user (cleanup)
// Route: DELETE /api/custom-rooms/cleanup
router.delete('/cleanup', customRoomController.deleteAllDemoCustomRooms);

// GET a single custom room by ID
// Route: GET /api/custom-rooms/:id
router.get('/:id', customRoomController.getCustomRoomById);

// CREATE a new custom room
// Route: POST /api/custom-rooms
router.post('/', customRoomController.createCustomRoom);

// UPDATE a custom room (e.g., add anchor points)
// Route: PUT /api/custom-rooms/:id
router.put('/:id', customRoomController.updateCustomRoom);

// DELETE a custom room
// Route: DELETE /api/custom-rooms/:id
router.delete('/:id', customRoomController.deleteCustomRoom);

module.exports = router;
