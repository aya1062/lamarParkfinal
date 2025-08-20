const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Auth routes - استخدام userController بدلاً من authController
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/me', authenticateToken, userController.getMe);

module.exports = router;



