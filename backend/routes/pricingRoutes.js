const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricingController');

router.get('/', pricingController.getPricing);
router.post('/calculate', pricingController.calculatePrice);
router.post('/', pricingController.addPricing);
router.put('/:id', pricingController.updatePricing);
router.delete('/:id', pricingController.deletePricing);

module.exports = router; 