const express = require('express')
const { protect } = require('../middlewares/authMiddleware')
const { authorize } = require('../middlewares/roleMiddleware')
const { addStudents, postAddStudent, viewStudents, deleteStudent, editStudentPage, updateStudent, addCoordinators, postAddCoordinator, viewCoordinator, deleteCoordinator, editCoordinatorPage, updateCoordinator, changeCoordinatorPassword, assignStudentsPage, assignStudents, addTeacher, createTeacher, getTeachers, getEditTeacher, updateTeacher, deleteTeacher, removeAssignedStudent, changeTeacherPassword, dashboard, viewStudentDetails, viewCoordinatorDetails } = require('../controllers/adminController')
const router = express.Router()

router
  .route('/addstudents')
  .get(protect, authorize('ADMIN'), addStudents)
  .post(protect, authorize('ADMIN'), postAddStudent)
router
  .route('/viewstudents')
  .get(protect, authorize('ADMIN'), viewStudents)

router
  .route('/viewstudentdetails/:id')
  .get(protect, authorize('ADMIN'),viewStudentDetails)
router
  .route('/students/delete/:id')
  .get(protect, authorize('ADMIN'), deleteStudent)

router
  .route('/students/edit/:id')
  .get(protect, authorize('ADMIN'), editStudentPage)

router
  .route('/students/update/:id')
  .post(protect, authorize('ADMIN'), updateStudent)


router
  .route('/addcoordinators')
  .get(protect, authorize('ADMIN'), addCoordinators)
  .post(protect, authorize('ADMIN'), postAddCoordinator)
router
  .route('/viewcoordinators')
  .get(protect, authorize('ADMIN'), viewCoordinator)

router
  .route('/viewcoordinatordetails/:id')
  .get(protect, authorize('ADMIN'),viewCoordinatorDetails)

router
  .route('/coordinators/delete/:id')
  .post(protect, authorize('ADMIN'), deleteCoordinator)


router
  .route('/coordinators/edit/:id')
  .get(protect, authorize('ADMIN'), editCoordinatorPage)

router
  .route('/coordinators/update/:id')
  .post(protect, authorize('ADMIN'), updateCoordinator)

router
  .route('/coordinators/change-password/:id')
  .post(protect, authorize('ADMIN'),changeCoordinatorPassword)

router
  .get('/dashboard', protect, authorize('ADMIN'), dashboard)

router
  .route("/assignstudents/:id")
  .get(protect, authorize('ADMIN'),assignStudentsPage)
  .post(protect, authorize('ADMIN'),assignStudents)

router
  .route('/addteachers')
  .get(protect, authorize('ADMIN'),addTeacher)
  .post(protect, authorize('ADMIN'),createTeacher)

router
  .route('/viewteachers')
  .get(protect, authorize('ADMIN'),getTeachers)

router
  .route('/teachers/edit/:id')
  .get(protect, authorize('ADMIN'),getEditTeacher)
  .post(protect, authorize('ADMIN'),updateTeacher)

router
  .route('/teachers/delete/:id')
  .post(protect, authorize('ADMIN'),deleteTeacher)

router
  .route('/assignstudents/:coordId/:studentId')
  .post(protect, authorize('ADMIN'),removeAssignedStudent)

router
  .route('/teachers/change-password/:id')
  .post(protect, authorize('ADMIN'),changeTeacherPassword)

module.exports = router
