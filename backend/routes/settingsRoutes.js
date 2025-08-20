const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticateToken } = require('../middleware/authMiddleware');

// جلب الإعدادات (مسموح فقط للأدمن)
router.get('/', authenticateToken, settingsController.getSettings);
// تحديث الإعدادات (مسموح فقط للأدمن)
router.put('/', authenticateToken, settingsController.updateSettings);

module.exports = router; 