const express = require('express')
const router = express.Router()

const { loginPage, adminLoginPage, teacherLoginPage, coordinatorLoginPage,login } = require('../controllers/authController')

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

module.exports = router
