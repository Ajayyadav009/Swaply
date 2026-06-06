const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  scheduleSession,
  getMySessions,
  updateSessionStatus,
  submitFeedback,
  getSessionHistory
} = require('../controllers/sessionController');

router.post('/schedule', protect, scheduleSession);
router.get('/my', protect, getMySessions);
router.get('/history', protect, getSessionHistory);
router.put('/:id/status', protect, updateSessionStatus);
router.post('/:id/feedback', protect, submitFeedback);

module.exports = router;