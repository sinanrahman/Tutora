const express=require('express')
const { AdminDashboardController } = require('../controllers/adminController')
const router=express.Router()

router
.route('/')
.get(AdminDashboardController)

module.exports=router