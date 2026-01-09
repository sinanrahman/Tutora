const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')


const { loginPage, adminLoginPage, teacherLoginPage, coordinatorLoginPage,login ,logout} = require('../controllers/authController')

router
    .route('/')
    .get(loginPage)
    
router
    .route('/adminlogin')
    .get(adminLoginPage)

router
    .route('/teacherLogin')
    .get(teacherLoginPage)

router
    .route('/coordinatorLogin')
    .get(coordinatorLoginPage)

router.post('/login', login)


router.get('/forgot-password', (req, res) => res.render('auth/forgotPassword', { msg: '' }))
router.post('/forgot-password', authController.forgotPassword)

// Reset Password
router.get('/reset-password/:token', authController.renderResetPasswordPage)
router.post('/reset-password/:token', authController.resetPassword)
router.get('/logout', logout);

module.exports = router
