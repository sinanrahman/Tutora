const express = require('express');
const router = express.Router();

//      MIDDLEWARE
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { setSidebarMenu } = require('../middlewares/sidebarMenu');

//      CONTROLLERS
const {
	dashboard,
	// Students
	addStudents,
	postAddStudent,
	viewStudents,
	viewStudentDetails,
	deleteStudent,
	editStudentPage,
	updateStudent,
	studentSessionHistory,
	addPackage,
	postAddPackage,
	// Coordinators
	addCoordinators,
	postAddCoordinator,
	viewCoordinator,
	viewCoordinatorDetails,
	deleteCoordinator,
	editCoordinatorPage,
	updateCoordinator,
	changeCoordinatorPassword,
	// Teachers
	addTeacher,
	createTeacher,
	getTeachers,
	viewTeacherProfile,
	getEditTeacher,
	updateTeacher,
	deleteTeacher,
	changeTeacherPassword,
	teacherSessionHistory,
	// Assignment Management
	getUpdateTeacher,
	addUpdateTeacher,
	removeUpdateTeacher,
	addFinance,
	postAddFinance,
	viewFinance,
	viewFinanceDetails,
	viewSalary,
	getAddSalary,
	addSalary,
	//invoice
	getInvoicePage,
	addInvoice,
	downloadInvoicePDF,
	viewInvoiceList,
	viewInvoicePDF,
	updateInvoiceStatus
} = require('../controllers/adminController');

// ==========================================
//              DASHBOARD ROUTES
// ==========================================

//      ADMIN DASHBOARD
router.get('/dashboard', protect, setSidebarMenu, authorize('ADMIN'), dashboard);

// ==========================================
//              STUDENT ROUTES
// ==========================================

//      ADD STUDENT
router
	.route('/addstudents')
	.get(protect, setSidebarMenu, authorize('ADMIN'), addStudents)
	.post(protect, setSidebarMenu, authorize('ADMIN'), postAddStudent);

//      VIEW ALL STUDENTS
router.route('/viewstudents').get(protect, setSidebarMenu, authorize('ADMIN'), viewStudents);

//      VIEW SINGLE STUDENT DETAILS
router
	.route('/viewstudentdetails/:id')
	.get(protect, setSidebarMenu, authorize('ADMIN'), viewStudentDetails);

//      EDIT STUDENT
router
	.route('/students/edit/:id')
	.get(protect, setSidebarMenu, authorize('ADMIN'), editStudentPage);

//      UPDATE STUDENT
router
	.route('/students/update/:id')
	.post(protect, setSidebarMenu, authorize('ADMIN'), updateStudent);

//      DELETE STUDENT
router
	.route('/students/delete/:id')
	.get(protect, setSidebarMenu, authorize('ADMIN'), deleteStudent);

//      STUDENT SESSION HISTORY
router
	.route('/students/history/:id')
	.get(protect, setSidebarMenu, authorize('ADMIN'), studentSessionHistory);

//              PACKAGE ROUTES

router
	.route('/addpackage/:studentId')
	.get(protect, setSidebarMenu, authorize('ADMIN'), addPackage)
	.post(protect, setSidebarMenu, authorize('ADMIN'), postAddPackage);


// ==========================================
//            COORDINATOR ROUTES
// ==========================================

//      ADD COORDINATOR
router
	.route('/addcoordinators')
	.get(protect, setSidebarMenu, authorize('ADMIN'), addCoordinators)
	.post(protect, setSidebarMenu, authorize('ADMIN'), postAddCoordinator);

//      VIEW ALL COORDINATORS
router.route('/viewcoordinators').get(protect, setSidebarMenu, authorize('ADMIN'), viewCoordinator);

//      VIEW SINGLE COORDINATOR DETAILS
router
	.route('/viewcoordinatordetails/:id')
	.get(protect, setSidebarMenu, authorize('ADMIN'), viewCoordinatorDetails);

//      EDIT COORDINATOR
router
	.route('/coordinators/edit/:id')
	.get(protect, setSidebarMenu, authorize('ADMIN'), editCoordinatorPage);

//      UPDATE COORDINATOR
router
	.route('/coordinators/update/:id')
	.post(protect, setSidebarMenu, authorize('ADMIN'), updateCoordinator);

//      DELETE COORDINATOR
router
	.route('/coordinators/delete/:id')
	.post(protect, setSidebarMenu, authorize('ADMIN'), deleteCoordinator);

//      CHANGE COORDINATOR PASSWORD
router
	.route('/coordinators/change-password/:id')
	.post(protect, setSidebarMenu, authorize('ADMIN'), changeCoordinatorPassword);

// ==========================================
//              TEACHER ROUTES
// ==========================================

//      ADD TEACHER
router
	.route('/addteachers')
	.get(protect, setSidebarMenu, authorize('ADMIN'), addTeacher)
	.post(protect, setSidebarMenu, authorize('ADMIN'), createTeacher);

//      VIEW ALL TEACHERS
router.route('/viewteachers').get(protect, setSidebarMenu, authorize('ADMIN'), getTeachers);

//      VIEW TEACHER PROFILE
router
	.route('/teachers/profile/:id')
	.get(protect, setSidebarMenu, authorize('ADMIN'), viewTeacherProfile);

//      EDIT TEACHER
router
	.route('/teachers/edit/:id')
	.get(protect, setSidebarMenu, authorize('ADMIN'), getEditTeacher)
	.post(protect, setSidebarMenu, authorize('ADMIN'), updateTeacher);

//      DELETE TEACHER
router
	.route('/teachers/delete/:id')
	.post(protect, setSidebarMenu, authorize('ADMIN'), deleteTeacher);

//      TEACHER SESSION HISTORY
router
	.route('/teachers/history/:id')
	.get(protect, setSidebarMenu, authorize('ADMIN'), teacherSessionHistory);

//      CHANGE TEACHER PASSWORD
router
	.route('/teachers/change-password/:id')
	.post(protect, setSidebarMenu, authorize('ADMIN'), changeTeacherPassword);

// ==========================================
//        TEACHER ASSIGNMENT ROUTES
// ==========================================

//      RENDER ASSIGN TEACHER PAGE
router.get(
	'/update-teacher/:studentId',
	protect,
	setSidebarMenu,
	authorize('ADMIN'),
	getUpdateTeacher
);

//      ADD TEACHER TO STUDENT
router.get(
	'/update-teacher/:studentId/add/:teacherId',
	protect,
	setSidebarMenu,
	authorize('ADMIN'),
	addUpdateTeacher
);

//      REMOVE TEACHER FROM STUDENT
router.get(
	'/update-teacher/:studentId/remove/:teacherId',
	protect,
	setSidebarMenu,
	authorize('ADMIN'),
	removeUpdateTeacher
);

router.get(
  "/viewfinance",
  protect,
  setSidebarMenu,
  authorize('ADMIN'),
  viewFinance
);

router.get(
  "/addfinance",
  protect,
  setSidebarMenu,
  authorize('ADMIN'),
  addFinance
);

router.post(
  "/addfinance",
  protect,
  setSidebarMenu,
  authorize('ADMIN'),
  postAddFinance
);

router.get(
  "/finance/:id",
  protect,
  setSidebarMenu,
  authorize('ADMIN'),
  viewFinanceDetails
);



router
	.route('/teachers/salary/:id')
	.get(protect, setSidebarMenu, authorize('ADMIN'),viewSalary)

router
	.route('/teachers/salary/:id/add')
	.get(protect, setSidebarMenu, authorize('ADMIN'),getAddSalary)
	.post(protect,setSidebarMenu,authorize('ADMIN'),addSalary)

// ==========================================
//        INVOICE ROUTES
// ==========================================
router
	.route('/addinvoice')
	.get(protect,setSidebarMenu,authorize('ADMIN'),getInvoicePage)
	.post(protect,setSidebarMenu,authorize('ADMIN'),addInvoice)
// Add this line to your routes file
router.get('/invoice/download/:id',protect,authorize('ADMIN'),downloadInvoicePDF)

router
.route('/viewinvoicelist')
.get(protect,setSidebarMenu,authorize('ADMIN'),viewInvoiceList)

router
	.route('/viewinvoice/:id')
	.get(protect,setSidebarMenu,authorize('ADMIN'),viewInvoicePDF)

router
.route('/invoice/updatestatus/:id')
.post(protect,setSidebarMenu,authorize('ADMIN'),updateInvoiceStatus);

module.exports = router;
