const express = require('express');
const router = express.Router();
const urwayController = require('../controllers/urwayController');

router.post('/create-urway-session', urwayController.createSession);

// راوت فحص إعدادات URWAY
router.get('/check-config', urwayController.checkUrwayConfig);

// راوت استقبال نتيجة الدفع من URWAY
router.post('/callback', urwayController.handleCallback);
router.get('/callback', urwayController.handleCallback);

// راوت استعلام المعاملات
router.post('/inquiry', urwayController.inquiryTransaction);

module.exports = router; 