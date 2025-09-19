const path = require('path');
const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const upload = propertyController.upload;
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// تعديل الراوتر ليستخدم الصور الستاتيك مؤقتاً

// Error handling middleware for file uploads
const handleUploadError = (err, req, res, next) => {
  if (err) {
    console.error('File upload error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        message: 'حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت' 
      });
    } else if (err.message.includes('نوع الملف غير مدعوم')) {
      return res.status(400).json({ 
        success: false, 
        message: err.message 
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ أثناء رفع الملف' 
    });
  }
  next();
};

// Routes
router.get('/', propertyController.getAllProperties);
router.get('/stats/active', propertyController.getActivePropertiesCount);
router.get('/stats/active-full', propertyController.getActivePropertiesStats);
router.get('/:id', propertyController.getPropertyById);

// File upload routes with error handling
router.post(
  '/', 
  upload.array('images', 10), // Max 10 files
  handleUploadError,
  propertyController.createProperty
);

router.put(
  '/:id', 
  upload.array('images', 10), // Max 10 files
  handleUploadError,
  propertyController.updateProperty
);

router.delete('/:id', propertyController.deleteProperty);
router.patch('/:id/status', propertyController.updatePropertyStatus);
router.post('/check-availability', propertyController.checkAvailability);

// Admin-only utility endpoint to bulk-assign chalets to a hotel by name
router.post('/admin/assign-chalets', authenticateToken, isAdmin, propertyController.assignChaletsToHotelByName);

module.exports = router;
