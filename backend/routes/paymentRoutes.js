const express = require('express');
const router = express.Router();
const { createPayment, handlePaymentResponse, inquireTransaction } = require('../controllers/paymentController');

// Create payment transaction (without auth for testing)
router.post('/create', createPayment);

// Handle payment response from URWAY
router.get('/response', handlePaymentResponse);

// Transaction inquiry (without auth for testing)
router.post('/inquiry', inquireTransaction);

module.exports = router;
