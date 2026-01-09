const express = require('express');
const router = express.Router();
const { authorize } = require('../middlewares/roleMiddleware');
const { protect } = require('../middlewares/authMiddleware');
const {
	teacherDashboard,
	teacherSessionsPage,
	addSessionPage,
	teacherProfilePage,
} = require('../controllers/teacherController');

router.get('/dashboard', protect, authorize('TEACHER'), teacherDashboard);
router.get('/sessions', protect, authorize('TEACHER'), teacherSessionsPage);
router.get('/sessions/add', protect, authorize('TEACHER'), addSessionPage);
router.get('/profile', protect, authorize('TEACHER'), teacherProfilePage);

module.exports = router;
