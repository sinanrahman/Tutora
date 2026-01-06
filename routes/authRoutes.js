const express = require('express')
const router = express.Router()

const { loginPage, adminLoginPage, teacherLoginPage, coordinatorLoginPage ,login} = require('../controllers/authController')

router
    .route('/')
    .get(loginPage)
    
router
    .route('/login')
    .post(login)

router
    .route('/adminlogin')
    .get(adminLoginPage)

router
    .route('/teacherLogin')
    .get(teacherLoginPage)

router
    .route('/coordinatorLogin')
    .get(coordinatorLoginPage)

module.exports = router
