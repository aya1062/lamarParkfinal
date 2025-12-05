const express = require('express');
const router = express.Router();
const roomBookingController = require('../controllers/roomBookingController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Stats (place before :id route to avoid conflicts)
router.get('/stats/summary', authenticateToken, isAdmin, roomBookingController.getBookingStats);

// Admin list (optionally filtered)
router.get('/', authenticateToken, isAdmin, roomBookingController.getAllRoomBookings);

// Public create and fetch-by-id
router.post('/', roomBookingController.createRoomBooking);
router.get('/:id', roomBookingController.getRoomBookingById);

// Admin/protected actions for status and lifecycle
router.patch('/:id/status', authenticateToken, isAdmin, roomBookingController.updateBookingStatus);
router.post('/:id/check-in', authenticateToken, isAdmin, roomBookingController.checkIn);
router.post('/:id/check-out', authenticateToken, isAdmin, roomBookingController.checkOut);
router.post('/:id/cancel', authenticateToken, isAdmin, roomBookingController.cancelBooking);

module.exports = router;
