const express = require('express')
const router = express.Router()

const { protect } = require('../middlewares/authMiddleware')
const { authorize } = require('../middlewares/roleMiddleware')
const {adminDashboard}=require('../controllers/adminController')

router
     .get('/dashboard',protect,authorize('ADMIN'),adminDashboard)


module.exports = router
