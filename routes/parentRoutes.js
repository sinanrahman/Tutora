const express = require('express');
const { parentDashboard, viewReport , viewPayment, viewClassHistory} = require('../controllers/parentController');
const { setSidebarMenu } = require('../middlewares/sidebarMenu');
const { authorize } = require('../middlewares/roleMiddleware');
const router = express.Router();

router
    .route('/dashboard')
    .get(setSidebarMenu,parentDashboard );

router
    .route('/viewreport')
    .get(viewReport)

router
    .route('/payment')
    .get(viewPayment)

router
    .route('/classhistory')
    .get(viewClassHistory)
module.exports = router;
