const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');

// إنشاء جلسة دفع
router.post('/create-session', checkoutController.createCheckoutSession);

// احذف أو عطل أي راوت خاص بـ Stripe (webhook أو غيره)
// جلب تفاصيل جلسة الدفع
router.get('/session/:sessionId', checkoutController.getSessionDetails);

module.exports = router; 