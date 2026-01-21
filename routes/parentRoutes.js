const express = require('express');
const { parentDashboard, viewReport , viewPayment, viewClassHistory, viewStudentInvoices, viewStudentInvoicePDF, downloadParentInvoicePDF} = require('../controllers/parentController');
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

router
  .route('/invoice/:id')
  .get(protect, setSidebarMenu, authorize('PARENT'), viewStudentInvoicePDF);

router.get(
  '/invoice/:id/download',
  protect,
  setSidebarMenu,
  authorize('PARENT'),
  downloadParentInvoicePDF
);


module.exports = router;
