const express = require('express');
const router = express.Router();

const { protect, isTeacher } = require('../middlewares/authMiddleware');
const {
	teacherDashboard,
	teacherSessionsPage,
	addSessionPage,
	teacherProfilePage,
} = require('../controllers/teacherController');

router.get('/dashboard', protect, isTeacher, teacherDashboard);
router.get('/sessions', protect, isTeacher, teacherSessionsPage);
router.get('/sessions/add', protect, isTeacher, addSessionPage);
router.get('/profile', protect, isTeacher, teacherProfilePage);

module.exports = router;
