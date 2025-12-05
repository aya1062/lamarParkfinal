const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');
const exportController = require('../controllers/exportController');

// Admin-only export for full data snapshot
router.get('/all', authenticateToken, isAdmin, exportController.exportAll);

module.exports = router;
