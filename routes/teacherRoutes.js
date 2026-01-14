const express = require('express');
const router = express.Router();

//      MIDDLEWARE
const { authorize } = require('../middlewares/roleMiddleware');
const { protect } = require('../middlewares/authMiddleware');

//      CONTROLLERS
const {
    teacherDashboard,
    teacherSessionsPage,
    addSessionPage,
    teacherProfilePage,
    viewStudentProfile,
    updateProfilePic
} = require('../controllers/teacherController');

//      TEACHER DASHBOARD
router
    .route('/dashboard')
    .get(protect, authorize('TEACHER'), teacherDashboard);

//      VIEW ALL SESSIONS
router
    .route('/sessions')
    .get(protect, authorize('TEACHER'), teacherSessionsPage);

//      ADD SESSION PAGE
router
    .route('/sessions/add')
    .get(protect, authorize('TEACHER'), addSessionPage);

//      TEACHER PROFILE
router
    .route('/profile')
    .get(protect, authorize('TEACHER'), teacherProfilePage);

//      STUDENT PROFILE
router
    .route('/studentProfile/:id')
    .get(protect, authorize('TEACHER'), viewStudentProfile);

router
    .route('/update-dp')
    .post(protect, authorize('TEACHER'), updateProfilePic)

module.exports = router;