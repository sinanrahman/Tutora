const express = require('express');
const router = express.Router();

//      MIDDLEWARE
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

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
} = require('../controllers/adminController');


// ==========================================
//              DASHBOARD ROUTES
// ==========================================

//      ADMIN DASHBOARD
router.get('/dashboard', protect, authorize('ADMIN'), dashboard);


// ==========================================
//              STUDENT ROUTES
// ==========================================

//      ADD STUDENT
router
    .route('/addstudents')
    .get(protect, authorize('ADMIN'), addStudents)
    .post(protect, authorize('ADMIN'), postAddStudent);

//      VIEW ALL STUDENTS
router
    .route('/viewstudents')
    .get(protect, authorize('ADMIN'), viewStudents);

//      VIEW SINGLE STUDENT DETAILS
router
    .route('/viewstudentdetails/:id')
    .get(protect, authorize('ADMIN'), viewStudentDetails);

//      EDIT STUDENT
router
    .route('/students/edit/:id')
    .get(protect, authorize('ADMIN'), editStudentPage);

//      UPDATE STUDENT
router
    .route('/students/update/:id')
    .post(protect, authorize('ADMIN'), updateStudent);

//      DELETE STUDENT
router
    .route('/students/delete/:id')
    .get(protect, authorize('ADMIN'), deleteStudent);

//      STUDENT SESSION HISTORY
router
    .route('/students/history/:id')
    .get(protect, authorize('ADMIN'), studentSessionHistory);


// ==========================================
//            COORDINATOR ROUTES
// ==========================================

//      ADD COORDINATOR
router
    .route('/addcoordinators')
    .get(protect, authorize('ADMIN'), addCoordinators)
    .post(protect, authorize('ADMIN'), postAddCoordinator);

//      VIEW ALL COORDINATORS
router
    .route('/viewcoordinators')
    .get(protect, authorize('ADMIN'), viewCoordinator);

//      VIEW SINGLE COORDINATOR DETAILS
router
    .route('/viewcoordinatordetails/:id')
    .get(protect, authorize('ADMIN'), viewCoordinatorDetails);

//      EDIT COORDINATOR
router
    .route('/coordinators/edit/:id')
    .get(protect, authorize('ADMIN'), editCoordinatorPage);

//      UPDATE COORDINATOR
router
    .route('/coordinators/update/:id')
    .post(protect, authorize('ADMIN'), updateCoordinator);

//      DELETE COORDINATOR
router
    .route('/coordinators/delete/:id')
    .post(protect, authorize('ADMIN'), deleteCoordinator);

//      CHANGE COORDINATOR PASSWORD
router
    .route('/coordinators/change-password/:id')
    .post(protect, authorize('ADMIN'), changeCoordinatorPassword);


// ==========================================
//              TEACHER ROUTES
// ==========================================

//      ADD TEACHER
router
    .route('/addteachers')
    .get(protect, authorize('ADMIN'), addTeacher)
    .post(protect, authorize('ADMIN'), createTeacher);

//      VIEW ALL TEACHERS
router
    .route('/viewteachers')
    .get(protect, authorize('ADMIN'), getTeachers);

//      VIEW TEACHER PROFILE
router
    .route('/teachers/profile/:id')
    .get(protect, authorize('ADMIN'), viewTeacherProfile);

//      EDIT TEACHER
router
    .route('/teachers/edit/:id')
    .get(protect, authorize('ADMIN'), getEditTeacher)
    .post(protect, authorize('ADMIN'), updateTeacher);

//      DELETE TEACHER
router
    .route('/teachers/delete/:id')
    .post(protect, authorize('ADMIN'), deleteTeacher);

//      TEACHER SESSION HISTORY
router
    .route('/teachers/history/:id')
    .get(protect, authorize('ADMIN'), teacherSessionHistory);

//      CHANGE TEACHER PASSWORD
router
    .route('/teachers/change-password/:id')
    .post(protect, authorize('ADMIN'), changeTeacherPassword);


// ==========================================
//        TEACHER ASSIGNMENT ROUTES
// ==========================================

//      RENDER ASSIGN TEACHER PAGE
router.get(
    '/update-teacher/:studentId',
    protect,
    authorize('ADMIN'),
    getUpdateTeacher
);

//      ADD TEACHER TO STUDENT
router.get(
    '/update-teacher/:studentId/add/:teacherId',
    protect,
    authorize('ADMIN'),
    addUpdateTeacher
);

//      REMOVE TEACHER FROM STUDENT
router.get(
    '/update-teacher/:studentId/remove/:teacherId',
    protect,
    authorize('ADMIN'),
    removeUpdateTeacher
);

module.exports = router;