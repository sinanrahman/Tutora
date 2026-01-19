const express = require('express');
const router = express.Router();

//      MIDDLEWARE
const { authorize } = require('../middlewares/roleMiddleware');
const { protect } = require('../middlewares/authMiddleware');
const { setSidebarMenu } = require('../middlewares/sidebarMenu');
//      CONTROLLERS
const {
	teacherDashboard,
	teacherSessionsPage,
	addSessionPage,
	teacherProfilePage,
	viewStudentProfile,
	updateProfilePic,
	  viewPendingSalaryPage,
} = require('../controllers/teacherController');

//      TEACHER DASHBOARD
router.route('/dashboard').get(protect, setSidebarMenu, authorize('TEACHER'), teacherDashboard);

//      VIEW ALL SESSIONS
router.route('/sessions').get(protect, setSidebarMenu, authorize('TEACHER'), teacherSessionsPage);

//      ADD SESSION PAGE
router.route('/sessions/add').get(protect, setSidebarMenu, authorize('TEACHER'), addSessionPage);

//      TEACHER PROFILE
router.route('/profile').get(protect, setSidebarMenu, authorize('TEACHER'), teacherProfilePage);

//      STUDENT PROFILE
router
	.route('/studentProfile/:id')
	.get(protect, setSidebarMenu, authorize('TEACHER'), viewStudentProfile);

router.route('/update-dp').post(protect, setSidebarMenu, authorize('TEACHER'), updateProfilePic);

// VIEW PENDING SALARY PAGE
router
  .route('/pending-salary')
  .get(protect, setSidebarMenu, authorize('TEACHER'), viewPendingSalaryPage);


module.exports = router;
