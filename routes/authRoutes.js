const express = require('express');
const router = express.Router();

//      CONTROLLERS
const {
    loginPage,
    adminLoginPage,
    teacherLoginPage,
    coordinatorLoginPage,
    login,
    logout,
    forgotPassword,
    renderResetPasswordPage,
    resetPassword,
    parentLoginPage,
    requestParentOTP,
    verifyParentOTP
} = require('../controllers/authController');


// ==========================================
//              LOGIN PAGE ROUTES
// ==========================================

//      RENDER MAIN SELECTION PAGE
router
    .route('/')
    .get(loginPage);

//      RENDER ADMIN LOGIN
router
    .route('/adminlogin')
    .get(adminLoginPage);

//      RENDER TEACHER LOGIN
router
    .route('/teacherLogin')
    .get(teacherLoginPage);

//      RENDER COORDINATOR LOGIN
router
    .route('/coordinatorLogin')
    .get(coordinatorLoginPage);

//      RENDER PARENT LOGIN
router
    .route('/parentLogin')
    .get(parentLoginPage);


// ==========================================
//              AUTH ACTION ROUTES
// ==========================================

//      HANDLE LOGIN SUBMISSION
router
    .route('/login')
    .post(login);

//      HANDLE LOGOUT
router
    .route('/logout')
    .get(logout);


// ==========================================
//          PASSWORD MANAGEMENT ROUTES
// ==========================================

//      FORGOT PASSWORD (REQUEST LINK)
router
    .route('/forgot-password')
    .get((req, res) => res.render('auth/forgotPassword', { msg: '' }))
    .post(forgotPassword);

//      RESET PASSWORD (ENTER NEW PASSWORD)
router
    .route('/reset-password/:token')
    .get(renderResetPasswordPage)
    .post(resetPassword);

router
    .route('/request-otp')
    .post(requestParentOTP);

router
    .route('/verify-otp')
    .post(verifyParentOTP);

module.exports = router;