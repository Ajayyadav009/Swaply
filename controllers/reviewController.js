const Review = require('../models/Review');
const User = require('../models/User');

// @route  POST /api/reviews/:userId
// @access Private
const createReview = async (req, res) => {
  try {
    const reviewerId = req.user._id;
    const revieweeId = req.params.userId;
    const { rating, comment } = req.body;

    // Can't review yourself
    if (reviewerId.toString() === revieweeId) {
      return res.status(400).json({ message: "You can't review yourself" });
    }

    // Check reviewee exists
    const reviewee = await User.findById(revieweeId);
    if (!reviewee) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already reviewed
    const alreadyReviewed = await Review.findOne({
      reviewer: reviewerId,
      reviewee: revieweeId
    });
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this user' });
    }

    // Create the review
    const review = await Review.create({
      reviewer: reviewerId,
      reviewee: revieweeId,
      rating,
      comment
    });

    // ── Recalculate user's average rating ──
    const allReviews = await Review.find({ reviewee: revieweeId });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await User.findByIdAndUpdate(revieweeId, {
      rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
      reviewCount: allReviews.length
    });

    res.status(201).json({ message: 'Review submitted', review });

  } catch (error) {
    // Handle duplicate key error from MongoDB
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this user' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/reviews/:userId
// @access Private
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: reviews.length,
      reviews
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReview, getUserReviews };