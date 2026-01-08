const express = require('express')
const { AdminDashboardController, AdminAddStudentsController, AdminViewStudentsController, AdminPostAddStudentController, AdminAddCoordinatorsController, AdminViewCoordinatorController, AdminPostAddCoordinatorController, AdminDeleteCoordinatorController, AdminEditCoordinatorPageController, AdminUpdateCoordinatorController, AdminDeleteStudentController, AdminEditStudentPageController, AdminUpdateStudentController, AdminAssignStudentsPageController, AdminAssignStudentsController, removeAssignedStudent, AdminAssignStudentsPage,AddTeacher, createTeacher, getAllTeachers, getEditTeacher, updateTeacher, deleteTeacher  } = require('../controllers/adminController')
const { protect } = require('../middlewares/authMiddleware')
const { authorize } = require('../middlewares/roleMiddleware')
const router = express.Router()

router
  .route('/')
  .get(AdminDashboardController)

router
  .route('/addstudents')
  .get(AdminAddStudentsController)
  .post(AdminPostAddStudentController)
router
  .route('/viewstudents')
  .get(AdminViewStudentsController)

router
  .route('/students/delete/:id')
  .get(AdminDeleteStudentController)

router
  .route('/students/edit/:id')
  .get(AdminEditStudentPageController)

router
  .route('/students/update/:id')
  .post(AdminUpdateStudentController)


router
  .route('/addcoordinators')
  .get(AdminAddCoordinatorsController)
  .post(AdminPostAddCoordinatorController)
router
  .route('/viewcoordinators')
  .get(AdminViewCoordinatorController)

router
  .route('/coordinators/delete/:id')
  .get(AdminDeleteCoordinatorController)


router
  .route('/coordinators/edit/:id')
  .get(AdminEditCoordinatorPageController)

router
  .route('/coordinators/update/:id')
  .post(AdminUpdateCoordinatorController)

  
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
