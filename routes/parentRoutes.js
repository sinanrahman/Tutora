const express = require('express');
const { parentDashboard } = require('../controllers/parentController');
const { setSidebarMenu } = require('../middlewares/sidebarMenu');
const { authorize } = require('../middlewares/roleMiddleware');
const router = express.Router();

router
    .route('/dashboard')
    .get(setSidebarMenu,parentDashboard );

module.exports = router;
