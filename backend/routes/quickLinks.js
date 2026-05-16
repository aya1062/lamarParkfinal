const express = require('express');
const router = express.Router();
const quickLinkController = require('../controllers/quickLinkController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/', quickLinkController.getQuickLinks);

// Protected routes (Admin only)
router.use(authenticateToken);
router.use(isAdmin);

router.post('/', quickLinkController.createQuickLink);
router.put('/:id', quickLinkController.updateQuickLink);
router.delete('/:id', quickLinkController.deleteQuickLink);

module.exports = router;
