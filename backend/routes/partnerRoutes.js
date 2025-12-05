const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', partnerController.getPartners);

// Protected routes (admin only)
router.get('/admin', authenticateToken, isAdmin, partnerController.getAllPartners);
router.get('/admin/:id', authenticateToken, isAdmin, partnerController.getPartnerById);
router.post('/', authenticateToken, isAdmin, partnerController.createPartner);
router.put('/:id', authenticateToken, isAdmin, partnerController.updatePartner);
router.delete('/:id', authenticateToken, isAdmin, partnerController.deletePartner);
router.put('/order/update', authenticateToken, isAdmin, partnerController.updatePartnerOrder);

module.exports = router;
