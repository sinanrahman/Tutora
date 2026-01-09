const express = require('express');
const router = express.Router();

const { protect, isTeacher, isCoordinator } = require('../middlewares/authMiddleware');
const { submitSession, approveSession } = require('../controllers/sessionController');

// teacher submits
router.post('/submit', protect, isTeacher, submitSession);

// coordinator approves
router.post('/approve/:id', protect, isCoordinator, approveSession);

module.exports = router;
