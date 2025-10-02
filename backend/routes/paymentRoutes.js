const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

// Initiate payment and receive redirect URL
router.post('/initiate', authenticateToken, paymentController.initiatePayment);

// Callbacks from ARB gateway
router.post('/callback/success', paymentController.handleSuccessCallback);
router.get('/callback/success', paymentController.handleSuccessCallback);
router.post('/callback/error', paymentController.handleErrorCallback);
router.get('/callback/error', paymentController.handleErrorCallback);

module.exports = router;


