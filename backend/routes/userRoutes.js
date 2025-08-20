const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/', authenticateToken, userController.getAllUsers);
router.get('/:id', authenticateToken, userController.getUserById);
router.get('/stats/new', authenticateToken, userController.getNewUsersStats);
router.get('/stats/new-full', authenticateToken, userController.getNewUsersStats);
router.put('/:id', authenticateToken, userController.updateUser);
router.delete('/:id', authenticateToken, userController.deleteUser);
router.patch('/:id/status', authenticateToken, userController.updateUserStatus);

module.exports = router;
