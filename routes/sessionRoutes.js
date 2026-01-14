const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { submitSession, approveSession } = require('../controllers/sessionController');

router
    .route('/submit')
    .post(protect, authorize('TEACHER'), submitSession);

router
    .route('/approve/:id')
    .post(protect, authorize('COORDINATOR'), approveSession);

module.exports = router;