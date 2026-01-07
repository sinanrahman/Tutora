const student=require('../models/StudentModel')
const Admin=require('../models/AdminModel')
const coordinator=require('../models/CoordinatorModel')


exports.AdminDashboardController=(req,res)=>{
    return res.render('admin/dashboard')
}
exports.AdminAddStudentsController = async (req, res) => {
  try {
    const coordinators = await coordinator.find().select("_id fullName")
    return res.render("admin/addstudents", { coordinators })
  } catch (err) {
    console.log(err)
    res.send("Error loading coordinators")
  }
}

exports.AdminPostAddStudentController=async (req,res)=>{
    const{fullname,email,phone,country,Class,gender,coordinator}=req.body
    await student.create({
        fullName:fullname,
        email:email,
        phone:phone,
        country:country,
        class:Class,
        gender:gender,
        coordinator:coordinator
    })
    res.redirect('/admin/viewstudents')
}


exports.AdminViewStudentsController = async (req, res) => {
  try {
    const students = await student.find().populate('coordinator', 'fullName email')
    res.render('admin/viewstudents', { students })
  } catch (err) {
    console.log(err)
    res.send("Error loading students")
  }
}


//co-ordinators
exports.AdminAddCoordinatorsController=(req,res)=>{
    return res.render('admin/addcoordinators')
}

exports.AdminPostAddCoordinatorController=async(req,res)=>{
    const{fullName,email,phone,password}=req.body
    const admin = await Admin.findOne()
		if (!admin) {
			return res.send('No admin found. Create an admin first.')
		}
    await coordinator.create({
        fullName:fullName,
        email:email,
        phone:phone,
        password:password,
        createdBy: admin._id
    })
    return res.redirect('/admin/viewcoordinators')
}

exports.AdminViewCoordinatorController = async (req, res) => {
  try {
    const coordinators = await coordinator.find().populate('createdBy', 'fullName email')
   return res.render('admin/viewcoordinators', { coordinators })

  } catch (err) {
    console.log(err)
    res.send("Error loading coordinators")
  }
}

exports.AdminDeleteCoordinatorController = async (req, res) => {
  try {
    const id = req.params.id
    await coordinator.findByIdAndDelete(id)
    res.redirect('/admin/viewcoordinators')
  } catch (err) {
    console.log(err)
    res.send("Error deleting coordinator")
  }
}


exports.AdminEditCoordinatorPageController = async (req, res) => {
  try {
    const id = req.params.id
    const coord = await coordinator.findById(id)
    if (!coord) return res.send("Coordinator not found")
    res.render("admin/editcoordinator", { coord })

  } catch (err) {
    console.log(err)
    res.send("Error loading edit page")
  }
}

exports.AdminUpdateCoordinatorController = async (req, res) => {
  try {
    const id = req.params.id
    const { fullName, email, phone } = req.body
    await coordinator.findByIdAndUpdate(id, {
      fullName,
      email,
      phone
    })
    res.redirect("/admin/viewcoordinators")

  } catch (err) {
    console.log(err)
    res.send("Error updating coordinator")
  }
}

