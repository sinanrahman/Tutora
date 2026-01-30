const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { setSidebarMenu } = require('../middlewares/sidebarMenu');

const { dashboard,addStudents,postAddStudent,viewStudents,viewStudentDetails,deleteStudent,editStudentPage,updateStudent,studentSessionHistory,addPackage,postAddPackage,addCoordinators,postAddCoordinator,viewCoordinator,viewCoordinatorDetails,deleteCoordinator,editCoordinatorPage,updateCoordinator,changeCoordinatorPassword,addTeacher,createTeacher,getTeachers,viewTeacherProfile,getEditTeacher,updateTeacher,deleteTeacher,changeTeacherPassword,teacherSessionHistory,getUpdateTeacher,addUpdateTeacher,removeUpdateTeacher,addFinance,postAddFinance,viewFinance,viewFinanceDetails,viewSalary,getAddSalary,addSalary,getInvoicePage,addInvoice,downloadInvoicePDF,viewInvoiceList,viewInvoicePDF,updateInvoiceStatus} = require('../controllers/adminController');

router
	.route('/dashboard')
	.get(protect, setSidebarMenu, authorize('ADMIN'), dashboard);

router
	.route('/addstudents')
	.get(protect, setSidebarMenu, authorize('ADMIN'), addStudents)
	.post(protect, setSidebarMenu, authorize('ADMIN'), postAddStudent);

router
	.route('/viewstudents')
	.get(protect, setSidebarMenu, authorize('ADMIN'), viewStudents);

router
	.route('/viewstudentdetails/:id')
	.get(protect, setSidebarMenu, authorize('ADMIN'), viewStudentDetails);

router
	.route('/students/edit/:id')
	.get(protect, setSidebarMenu, authorize('ADMIN'), editStudentPage);

router
	.route('/students/update/:id')
	.post(protect, setSidebarMenu, authorize('ADMIN'), updateStudent);

router
	.route('/students/delete/:id')
	.get(protect, setSidebarMenu, authorize('ADMIN'), deleteStudent);

router
	.route('/students/history/:id')
	.get(protect, setSidebarMenu, authorize('ADMIN'), studentSessionHistory);

router
	.route('/addpackage/:studentId')
	.get(protect, setSidebarMenu, authorize('ADMIN'), addPackage)
	.post(protect, setSidebarMenu, authorize('ADMIN'), postAddPackage);

router
	.route('/addcoordinators')
	.get(protect, setSidebarMenu, authorize('ADMIN'), addCoordinators)
	.post(protect, setSidebarMenu, authorize('ADMIN'), postAddCoordinator);

router
	.route('/viewcoordinators')
	.get(protect, setSidebarMenu, authorize('ADMIN'), viewCoordinator);

router
	.route('/viewcoordinatordetails/:id')
	.get(protect, setSidebarMenu, authorize('ADMIN'), viewCoordinatorDetails);

router
	.route('/coordinators/edit/:id')
	.get(protect, setSidebarMenu, authorize('ADMIN'), editCoordinatorPage);

router
	.route('/coordinators/update/:id')
	.post(protect, setSidebarMenu, authorize('ADMIN'), updateCoordinator);

router
	.route('/coordinators/delete/:id')
	.post(protect, setSidebarMenu, authorize('ADMIN'), deleteCoordinator);

router
	.route('/coordinators/change-password/:id')
	.post(protect, setSidebarMenu, authorize('ADMIN'), changeCoordinatorPassword);

router
	.route('/addteachers')
	.get(protect, setSidebarMenu, authorize('ADMIN'), addTeacher)
	.post(protect, setSidebarMenu, authorize('ADMIN'), createTeacher);

router.route('/viewteachers').get(protect, setSidebarMenu, authorize('ADMIN'), getTeachers);

router
	.route('/teachers/profile/:id')
	.get(protect, setSidebarMenu, authorize('ADMIN'), viewTeacherProfile);

router
	.route('/teachers/edit/:id')
	.get(protect, setSidebarMenu, authorize('ADMIN'), getEditTeacher)
	.post(protect, setSidebarMenu, authorize('ADMIN'), updateTeacher);

router
	.route('/teachers/delete/:id')
	.post(protect, setSidebarMenu, authorize('ADMIN'), deleteTeacher);

router
	.route('/teachers/history/:id')
	.get(protect, setSidebarMenu, authorize('ADMIN'), teacherSessionHistory);

router
	.route('/teachers/change-password/:id')
	.post(protect, setSidebarMenu, authorize('ADMIN'), changeTeacherPassword);


router
	.route('/update-teacher/:studentId')
	.get(protect,setSidebarMenu,authorize('ADMIN'),getUpdateTeacher);

router
	.route('/update-teacher/:studentId/add/:teacherId')
	.get(protect,setSidebarMenu,authorize('ADMIN'),addUpdateTeacher);

router
	.route('/update-teacher/:studentId/remove/:teacherId')
	.get(protect,setSidebarMenu,authorize('ADMIN'),removeUpdateTeacher);

router
	.route("/viewfinance")
	.get(protect,setSidebarMenu,authorize('ADMIN'),viewFinance);

router
	.route( "/addfinance")
	.get(protect,setSidebarMenu,authorize('ADMIN'),addFinance);

router
	.route("/addfinance")
	.post(protect,setSidebarMenu,authorize('ADMIN'),postAddFinance);

router
	.route("/finance/:id")
	.get(protect,setSidebarMenu,authorize('ADMIN'),viewFinanceDetails);

router
	.route('/teachers/salary/:id')
	.get(protect, setSidebarMenu, authorize('ADMIN'),viewSalary)

router
	.route('/teachers/salary/:id/add')
	.get(protect, setSidebarMenu, authorize('ADMIN'),getAddSalary)
	.post(protect,setSidebarMenu,authorize('ADMIN'),addSalary)

router
	.route('/addinvoice')
	.get(protect,setSidebarMenu,authorize('ADMIN'),getInvoicePage)
	.post(protect,setSidebarMenu,authorize('ADMIN'),addInvoice)

router
	.route('/invoice/download/:id')
	.get(protect,authorize('ADMIN'),downloadInvoicePDF)

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
