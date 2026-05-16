const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// مسارات عامة (لا تحتاج مصادقة)
router.get('/', hotelController.getAllHotels);
router.get('/:id', hotelController.getHotelById);

// مسارات محمية للإدارة
router.use(authenticateToken, isAdmin);
const hotelUploads = hotelController.upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'installmentLogoImages', maxCount: 8 }
]);

const runHotelUploads = (req, res, next) => {
  hotelUploads(req, res, (err) => {
    if (err) {
      console.error('Hotel upload error:', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'حدث خطأ أثناء رفع الملفات'
      });
    }
    next();
  });
};

router.post('/', runHotelUploads, hotelController.createHotel);
router.put('/:id', runHotelUploads, hotelController.updateHotel);
router.delete('/:id', hotelController.deleteHotel);
router.patch('/:id/status', hotelController.updateHotelStatus);
router.get('/:id/stats', hotelController.getHotelStats);

module.exports = router;
