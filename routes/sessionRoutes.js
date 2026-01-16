const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { setSidebarMenu } = require('../middlewares/sidebarMenu');
const { submitSession, approveSession } = require('../controllers/sessionController');

router.route('/submit').post(protect, setSidebarMenu, authorize('TEACHER'), submitSession);

router
	.route('/approve/:id')
	.post(protect, setSidebarMenu, authorize('COORDINATOR'), approveSession);

module.exports = router;
