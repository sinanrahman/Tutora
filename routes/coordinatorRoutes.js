const express = require('express');
const router = express.Router();

//      MIDDLEWARE
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

//      CONTROLLERS
const {
    coordinatorDashboard,
    getAssignedStudents,
    getStudentProfile,
    assignTeachers,
    getSessionApprovalPage,
    approveSession,
    getUpdateTeacher,
    removeUpdateTeacher,
    addUpdateTeacher
} = require('../controllers/coordinatorController');


// ==========================================
//              DASHBOARD ROUTES
// ==========================================

//      COORDINATOR DASHBOARD
router
    .route('/dashboard')
    .get(protect, authorize('COORDINATOR'), coordinatorDashboard);


// ==========================================
//              STUDENT ROUTES
// ==========================================

//      VIEW ASSIGNED STUDENTS
router
    .route('/assigned-students')
    .get(protect, authorize('COORDINATOR'), getAssignedStudents);

//      VIEW SINGLE STUDENT PROFILE
router
    .route('/student/:id')
    .get(protect, authorize('COORDINATOR'), getStudentProfile);

//      ASSIGN TEACHERS (FORM SUBMISSION)
router
    .route('/assign-teachers/:studentId')
    .post(protect, authorize('COORDINATOR'), assignTeachers);


// ==========================================
//              SESSION ROUTES
// ==========================================

//      SESSION APPROVAL PAGE
router
    .route('/session-approval')
    .get(protect, authorize('COORDINATOR'), getSessionApprovalPage);

//      APPROVE SPECIFIC SESSION
router
    .route('/sessions/approve/:id')
    .post(protect, authorize('COORDINATOR'), approveSession);


// ==========================================
//        TEACHER ASSIGNMENT ROUTES
// ==========================================

//      RENDER ASSIGN TEACHER PAGE
router
    .route('/update-teacher/:studentId')
    .get(protect, authorize('COORDINATOR'), getUpdateTeacher);

//      ADD TEACHER TO STUDENT
router
    .route('/update-teacher/:studentId/add/:teacherId')
    .get(protect, authorize('COORDINATOR'), addUpdateTeacher);

//      REMOVE TEACHER FROM STUDENT
router
    .route('/update-teacher/:studentId/remove/:teacherId')
    .get(protect, authorize('COORDINATOR'), removeUpdateTeacher);

module.exports = router;