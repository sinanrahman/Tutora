const express = require('express');
const { parentDashboard, viewReport , viewPayment, viewClassHistory} = require('../controllers/parentController');
const { setSidebarMenu } = require('../middlewares/sidebarMenu');
const { authorize } = require('../middlewares/roleMiddleware');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router
    .route('/dashboard')
    .get(protect,setSidebarMenu,authorize('PARENT'),parentDashboard );
 
router
    .route('/viewreport')
    .get(protect,setSidebarMenu,authorize('PARENT'),viewReport)

router
    .route('/payment')
  .get(protect,setSidebarMenu,authorize('PARENT'),viewPayment)

router
    .route('/classhistory')
    .get(protect,setSidebarMenu,authorize('PARENT'),viewClassHistory)
  
module.exports = router;
