const express = require('express');
const router = express.Router();
const { listUsers, createUser, getUserById, updateUser, deleteUser, getMyTeam } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Logged in user routes
router.get('/me/team', authMiddleware, roleMiddleware('manager', 'admin'), getMyTeam);

// Admin only routes
router.get('/', authMiddleware, roleMiddleware('admin'), listUsers);
router.post('/', authMiddleware, roleMiddleware('admin'), createUser);
router.get('/:id', authMiddleware, roleMiddleware('admin'), getUserById);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateUser);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteUser);

module.exports = router;
