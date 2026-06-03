const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createReview, getUserReviews } = require('../controllers/reviewController');

router.post('/:userId', protect, createReview);
router.get('/:userId', protect, getUserReviews);

module.exports = router;