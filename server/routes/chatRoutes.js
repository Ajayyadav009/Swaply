const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authmiddleware');

const {
    getChatHistory,
    getMyConversation
} = require('../controllers/chatController');
router.get('/history/:roomid', protect, getChatHistory);
router.get('/conversations', protect, getMyConversation);

module.exports = router;
