const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricingController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Public: fetch pricing for a property (optional month filter)
router.get('/', pricingController.getPricing);

// Public: calculate dynamic price for a date range
router.post('/calculate', pricingController.calculatePrice);

// Protected admin: CRUD pricing entries
router.post('/', authenticateToken, isAdmin, pricingController.addPricing);
router.put('/:id', authenticateToken, isAdmin, pricingController.updatePricing);
router.delete('/:id', authenticateToken, isAdmin, pricingController.deletePricing);

module.exports = router;
