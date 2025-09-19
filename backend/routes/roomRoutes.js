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
router.post('/', roomController.upload.array('images', 10), roomController.createRoom);
router.put('/:id', roomController.upload.array('images', 10), roomController.updateRoom);
router.delete('/:id', roomController.deleteRoom);
router.patch('/:roomId/availability', roomController.updateRoomAvailability);
router.get('/:id/stats', roomController.getRoomStats);

module.exports = router;
