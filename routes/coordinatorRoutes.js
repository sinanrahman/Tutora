const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { setSidebarMenu } = require('../middlewares/sidebarMenu');

const {coordinatorDashboard,coordinatorStudentlist,getAssignedStudents,getStudentProfile,assignTeachers,getSessionApprovalPage,approveSession,getUpdateTeacher,removeUpdateTeacher,addUpdateTeacher,getAddReport,postAddReport,editReport,deleteReport,getReports,} = require('../controllers/coordinatorController');

router
	.route('/dashboard')
	.get(protect, setSidebarMenu, authorize('COORDINATOR'), coordinatorDashboard);

router
	.route('/students')
	.get(protect, setSidebarMenu, authorize('COORDINATOR'), coordinatorStudentlist);

router
	.route('/assigned-students')
	.get(protect, setSidebarMenu, authorize('COORDINATOR'), getAssignedStudents);

router
	.route('/student/:id')
	.get(protect, setSidebarMenu, authorize('COORDINATOR'), getStudentProfile);

router
	.route('/assign-teachers/:studentId')
	.post(protect, setSidebarMenu, authorize('COORDINATOR'), assignTeachers);

router
	.route('/session-approval')
	.get(protect, setSidebarMenu, authorize('COORDINATOR'), getSessionApprovalPage);

router
	.route('/sessions/approve/:id')
	.post(protect, setSidebarMenu, authorize('COORDINATOR'), approveSession);

router
	.route('/update-teacher/:studentId')
	.get(protect, setSidebarMenu, authorize('COORDINATOR'), getUpdateTeacher);

router
	.route('/update-teacher/:studentId/add/:teacherId')
	.get(protect, setSidebarMenu, authorize('COORDINATOR'), addUpdateTeacher);

router
	.route('/update-teacher/:studentId/remove/:teacherId')
	.get(protect, setSidebarMenu, authorize('COORDINATOR'), removeUpdateTeacher);

router
	.route('/add-report/:studentId')
	.get(protect,authorize('COORDINATOR'),setSidebarMenu,getAddReport);
	
router
	.route('/add-report/:studentId')
	.post(protect,authorize('COORDINATOR'),postAddReport);

router
	.route('/reports/:studentId')
	.get(protect,authorize('COORDINATOR'),setSidebarMenu,getReports);

router
	.route('/edit-report/:id')
	.post(protect,authorize('COORDINATOR'),editReport);

router
	.route('/delete-report/:id')
	.post(protect,authorize('COORDINATOR'),deleteReport);

module.exports = router;
