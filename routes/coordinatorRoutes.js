const express = require('express')
const {
    coordinatorDashboard,
    getAssignedStudents,
    getStudentProfile,
    assignTeachers
} = require('../controllers/coordinatorController')

const { protect } = require('../middlewares/authMiddleware')
const { authorize } = require('../middlewares/roleMiddleware')

const router = express.Router()

router.get(
    '/dashboard',
    protect,
    authorize('COORDINATOR'),
    coordinatorDashboard
)

router.get(
    '/assigned-students',
    protect,
    authorize('COORDINATOR'),
    getAssignedStudents
)

router.get(
    '/student/:id',
    protect,
    authorize('COORDINATOR'),
    getStudentProfile
)

router.post(
    '/assign-teachers/:studentId',
    protect,
    authorize('COORDINATOR'),
    assignTeachers
)

module.exports = router
