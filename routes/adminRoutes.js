const express = require('express')
const { AdminDashboardController, AdminAddStudentsController, AdminViewStudentsController, AdminPostAddStudentController, AdminAddCoordinatorsController, AdminViewCoordinatorController, AdminPostAddCoordinatorController, AdminDeleteCoordinatorController, AdminEditCoordinatorPageController, AdminUpdateCoordinatorController, AdminDeleteStudentController, AdminEditStudentPageController, AdminUpdateStudentController, AdminAssignStudentsPageController, AdminAssignStudentsController, removeAssignedStudent, AdminAssignStudentsPage,AddTeacher, createTeacher, getAllTeachers, getEditTeacher, updateTeacher, deleteTeacher  } = require('../controllers/adminController')
const { protect } = require('../middlewares/authMiddleware')
const { authorize } = require('../middlewares/roleMiddleware')
const router = express.Router()

router
  .route('/addstudents')
  .get( protect, authorize('ADMIN'),AdminAddStudentsController)
  .post( protect, authorize('ADMIN'),AdminPostAddStudentController)
router
  .route('/viewstudents')
  .get( protect, authorize('ADMIN'),AdminViewStudentsController)

router
  .route('/students/delete/:id')
  .get( protect, authorize('ADMIN'),AdminDeleteStudentController)

router
  .route('/students/edit/:id')
  .get( protect, authorize('ADMIN'),AdminEditStudentPageController)

router
  .route('/students/update/:id')
  .post( protect, authorize('ADMIN'),AdminUpdateStudentController)


router
  .route('/addcoordinators')
  .get( protect, authorize('ADMIN'),AdminAddCoordinatorsController)
  .post( protect, authorize('ADMIN'),AdminPostAddCoordinatorController)
router
  .route('/viewcoordinators')
  .get( protect, authorize('ADMIN'),AdminViewCoordinatorController)

router
  .route('/coordinators/delete/:id')
  .get( protect, authorize('ADMIN'),AdminDeleteCoordinatorController)


router
  .route('/coordinators/edit/:id')
  .get( protect, authorize('ADMIN'),AdminEditCoordinatorPageController)

router
  .route('/coordinators/update/:id')
  .post(protect, authorize('ADMIN'),AdminUpdateCoordinatorController)

  
router
  .get('/dashboard', protect, authorize('ADMIN'), AdminDashboardController)

router
  .route("/assignstudents/:id")
  .get(AdminAssignStudentsPage)      
  .post(AdminAssignStudentsController) 

router
  .route('/addteachers')
  .get(AddTeacher)
  .post(createTeacher)

router
  .route('/viewteachers')
  .get(getAllTeachers)

router
  .route('/teachers/edit/:id')
  .get(getEditTeacher)
  .post(updateTeacher)

router
  .route('/teachers/delete/:id')
  .post(deleteTeacher)

  router
  .route( '/assignstudents/:coordId/:studentId')
  .post(removeAssignedStudent)

  module.exports = router
