const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * POST /api/payment/initiate
 * Initiate ARB payment - encrypts transaction and returns payment URL
 * Body: { amount, trackId, bookingId }
 */
router.post('/initiate', paymentController.initiatePayment);

/**
 * POST /api/payment/response
 * ARB callback endpoint - receives encrypted trandata after payment
 * Body: { trandata: <encrypted_string> }
 * Content-Type: application/x-www-form-urlencoded
 */
router.post('/response', paymentController.handlePaymentResponse);

/**
 * GET /api/payment/error
 * ARB may redirect the browser to this URL on error. Redirect user to frontend error page.
 * Accepts optional query params like reason or trackId.
 */
router.get('/error', paymentController.handlePaymentError);

// Also accept POST from ARB to the /error endpoint and handle it the same as /response
router.post('/error', paymentController.handlePaymentResponse);

/**
 * GET /api/payment/verify/:trackId
 * Verify payment status for a booking
 */
router.get('/verify/:trackId', paymentController.verifyPayment);

/**
 * GET /api/payment/diagnose
 * Quick health check for ARB config
 */
router.get('/diagnose', paymentController.diagnose);

module.exports = router;
