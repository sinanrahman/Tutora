const express = require('express')
const router = express.Router()

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


router.get('/admin/logout', logout);

module.exports = router
