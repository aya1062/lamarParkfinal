const express = require('express');
const router = express.Router();
const roomBookingController = require('../controllers/roomBookingController');
const { authenticateToken } = require('../middleware/authMiddleware');

// مسارات عامة (لا تحتاج مصادقة)
router.post('/', roomBookingController.createRoomBooking);
router.get('/', roomBookingController.getAllRoomBookings);
router.get('/:id', roomBookingController.getRoomBookingById);

// مسارات محمية (تحتاج مصادقة)
router.use(authenticateToken);

// مسارات الإدارة
router.patch('/:id/status', roomBookingController.updateBookingStatus);
router.post('/:id/check-in', roomBookingController.checkIn);
router.post('/:id/check-out', roomBookingController.checkOut);
router.post('/:id/cancel', roomBookingController.cancelBooking);
router.get('/stats/overview', roomBookingController.getBookingStats);

module.exports = router;
