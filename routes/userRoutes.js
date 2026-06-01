const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authmiddleware');

const {
    getMyProfile,
    updateProfile,
    getUserById
} = require('../controllers/userController');
router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateProfile);
router.get('/:id', protect, getUserById);

module.exports = router;
