const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authenticateToken } = require('../middleware/authMiddleware');

// مسارات عامة (لا تحتاج مصادقة)
router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoomById);
router.post('/check-availability', roomController.checkRoomAvailability);

// مسارات محمية (تحتاج مصادقة)
router.use(authenticateToken);

// مسارات الإدارة
const roomUploads = roomController.upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'installmentLogoImages', maxCount: 8 }
]);
router.post('/', roomUploads, roomController.createRoom);
router.put('/:id', roomUploads, roomController.updateRoom);
router.delete('/:id', roomController.deleteRoom);
router.patch('/:roomId/availability', roomController.updateRoomAvailability);
router.get('/:id/stats', roomController.getRoomStats);

module.exports = router;
