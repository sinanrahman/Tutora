const express = require('express');
const router = express.Router();
const { authorize } = require('../middlewares/roleMiddleware');
const { protect } = require('../middlewares/authMiddleware');
const { submitSession, approveSession } = require('../controllers/sessionController');

// teacher submits
router.post('/submit', protect, authorize('TEACHER'), submitSession);

// coordinator approves
router.post('/approve/:id', protect, authorize('COORDINATOR'), approveSession);

module.exports = router;
