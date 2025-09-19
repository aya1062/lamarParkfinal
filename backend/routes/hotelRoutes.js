const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// مسارات عامة (لا تحتاج مصادقة)
router.get('/', hotelController.getAllHotels);
router.get('/:id', hotelController.getHotelById);

// مسارات محمية للإدارة
router.use(authenticateToken, isAdmin);
router.post('/', hotelController.upload.array('images', 10), hotelController.createHotel);
router.put('/:id', hotelController.upload.array('images', 10), hotelController.updateHotel);
router.delete('/:id', hotelController.deleteHotel);
router.patch('/:id/status', hotelController.updateHotelStatus);
router.get('/:id/stats', hotelController.getHotelStats);

module.exports = router;
