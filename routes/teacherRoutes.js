const express = require('express');
const router = express.Router();

const { authorize } = require('../middlewares/roleMiddleware');
const { protect } = require('../middlewares/authMiddleware');
const { setSidebarMenu } = require('../middlewares/sidebarMenu');

const {teacherDashboard,teacherSessionsPage,addSessionPage,teacherProfilePage,viewStudentProfile,updateProfilePic,viewPendingSalaryPage,dashboard,viewStudents,} = require('../controllers/teacherController');

router
	.route('/dashboard')
	.get(protect, setSidebarMenu, authorize('TEACHER'), dashboard);

router
	.route('/students')
	.get(protect, setSidebarMenu, authorize('TEACHER'), viewStudents);

router
	.route('/sessions')
	.get(protect, setSidebarMenu, authorize('TEACHER'), teacherSessionsPage);

router
	.route('/sessions/add')
	.get(protect, setSidebarMenu, authorize('TEACHER'), addSessionPage);

router
	.route('/profile')
	.get(protect, setSidebarMenu, authorize('TEACHER'), teacherProfilePage);

router
	.route('/studentProfile/:id')
	.get(protect, setSidebarMenu, authorize('TEACHER'), viewStudentProfile);

router
	.route('/update-dp')
	.post(protect, setSidebarMenu, authorize('TEACHER'), updateProfilePic);

router
  .route('/pending-salary')
  .get(protect, setSidebarMenu, authorize('TEACHER'), viewPendingSalaryPage);

module.exports = router;
