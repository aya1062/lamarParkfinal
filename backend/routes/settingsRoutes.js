const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Public: get current settings
router.get('/', settingsController.getSettings);

// Admin: update settings
router.put('/', authenticateToken, isAdmin, settingsController.updateSettings);

module.exports = router;
