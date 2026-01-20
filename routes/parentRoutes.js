const express = require('express');
const { parentDashboard, viewReport , viewPayment, viewClassHistory, viewStudentInvoices, viewStudentInvoicePDF} = require('../controllers/parentController');
const { setSidebarMenu } = require('../middlewares/sidebarMenu');
const { authorize } = require('../middlewares/roleMiddleware');
const { protect } = require('../middlewares/authMiddleware');
const { downloadInvoicePDF } = require('../controllers/adminController');
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
  .route('/sessions')
  .get(protect, setSidebarMenu, authorize('PARENT'), viewClassHistory);


//   router
//   .route('/student/:studentId/invoices')
//   .get(protect, setSidebarMenu, authorize('PARENT'),viewStudentInvoices)

// // View invoice page

//  router
//   .route('/student/invoice/:id')
//   .get(protect, setSidebarMenu, authorize('PARENT'),viewStudentInvoicePDF)

//  router
//   .route('/student/invoice/download/:id')
//   .get(protect, setSidebarMenu, authorize('PARENT'),downloadInvoicePDF)


module.exports = router;
