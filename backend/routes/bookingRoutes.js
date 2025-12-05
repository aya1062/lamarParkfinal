const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', bookingController.getAllBookings);
router.get('/revenue/yearly', bookingController.getYearlyRevenueStats);
router.get('/recent', bookingController.getRecentBookings);
router.get('/bookings/yearly', bookingController.getYearlyBookingStats);
router.patch('/:id/status', bookingController.updateBookingStatus);
router.get('/user', authenticateToken, bookingController.getUserBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/', authenticateToken, bookingController.createBooking);
router.put('/:id', bookingController.updateBooking);
router.delete('/:id', bookingController.deleteBooking);
router.get('/stats/total', bookingController.getTotalBookingsStats);
router.get('/stats/revenue', bookingController.getTotalRevenueStats);
router.get('/number/:bookingNumber', bookingController.getBookingByNumber);

module.exports = router;
