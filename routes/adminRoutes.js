const express = require('express')
const { AdminDashboardController, AdminAddStudentsController, AdminViewStudentsController, AdminPostAddStudentController, AdminAddCoordinatorsController, AdminViewCoordinatorController, AdminPostAddCoordinatorController, AdminDeleteCoordinatorController, AdminEditCoordinatorPageController, AdminUpdateCoordinatorController } = require('../controllers/adminController')
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

module.exports = router