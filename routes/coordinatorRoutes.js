const express = require('express')
const {
    coordinatorDashboard,
    getAssignedStudents,
    getStudentProfile,
    assignTeachers, getSessionApprovalPage,
    approveSession,
    getUpdateTeacher
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

router.get(
    '/session-approval',
    protect,
    authorize('COORDINATOR'),
    getSessionApprovalPage
);

router.post(
    '/sessions/approve/:id',
    protect,
    authorize('COORDINATOR'),
    approveSession
);
router.get(
    '/update-teacher/:studentId',
    protect,
    authorize('COORDINATOR'),
    getUpdateTeacher
)

module.exports = router
