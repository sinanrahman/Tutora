const express = require('express');
const router = express.Router();

const {loginPage,adminLoginPage,teacherLoginPage,coordinatorLoginPage,login,logout,forgotPassword,renderResetPasswordPage,resetPassword,parentLoginPage,requestParentOTP,verifyParentOTP} = require('../controllers/authController');

router
    .route('/')
    .get(loginPage);

router
    .route('/adminlogin')
    .get(adminLoginPage);

router
    .route('/teacherLogin')
    .get(teacherLoginPage);

router
    .route('/coordinatorLogin')
    .get(coordinatorLoginPage);

router
    .route('/parentLogin')
    .get(parentLoginPage);

router
    .route('/login')
    .post(login);

router
    .route('/logout')
    .get(logout);

router
    .route('/forgot-password')
    .get((req, res) => res.render('auth/forgotPassword', { msg: '' }))
    .post(forgotPassword);

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