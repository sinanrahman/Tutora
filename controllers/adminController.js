const student=require('../models/Student')
const Admin=require('../models/Admin')
const coordinator=require('../models/Coordinator')


exports.AdminDashboardController = async (req, res) => {
  try {
    const totalStudents = await student.countDocuments()
    const totalCoordinators = await coordinator.countDocuments()
    const totalActiveStudents = await student.countDocuments({ status: "active" })
    const totalInactiveStudents = await student.countDocuments({ status: "inactive" })
    const totalActiveCoordinators = await coordinator.countDocuments({ isActive: true })

    res.render("admin/dashboard", {
      totalStudents,
      totalCoordinators,
      totalActiveStudents,
      totalInactiveStudents,
      totalActiveCoordinators
    })
  } catch (err) {
    console.log(err)
    res.send("Error loading dashboard")
  }
}


//students
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
    const{fullname,email,phone,country,standard,gender,coordinator}=req.body
    await student.create({
        fullName:fullname,
        email:email,
        phone:phone,
        country:country,
        standard:standard,
        gender:gender,
        coordinator:coordinator
    })
    res.redirect('/admin/viewstudents')
}


exports.AdminViewStudentsController = async (req, res) => {
  try {
    const students = await student.find() .populate('coordinator', 'fullName email')
    res.render('admin/viewstudents', { students })
  } catch (err) {
    console.log(err)
    res.send("Error loading students")
  }
}

exports.AdminEditStudentPageController = async (req, res) => {
  try {
    const id = req.params.id
    const stud = await student.findById(id)
    const coordinators = await coordinator.find().select("_id fullName")

    if (!stud) return res.send("Student not found")
    res.render("admin/editstudent", { student: stud, coordinators })
  } catch (err) {
    console.log(err)
    res.send("Error loading edit page")
  }
}

exports.AdminUpdateStudentController = async (req, res) => {
  try {
    const id = req.params.id
     const{fullname,email,phone,country,standard,gender,coordinator}=req.body
    await student.findByIdAndUpdate(id, {
        fullName:fullname,
        email:email,
        phone:phone,
        country:country,
        standard:standard,
        gender:gender,
        coordinator:coordinator
    })
    res.redirect("/admin/viewstudents")

  } catch (err) {
    console.log(err)
    res.send("Error updating student")
  }
}



exports.AdminDeleteStudentController = async (req, res) => {
  try {
    const id = req.params.id
    await student.findByIdAndDelete(id)
    res.redirect('/admin/viewstudents')
  } catch (err) {
    console.log(err)
    res.send("Error deleting student")
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
    const coordinators = await coordinator.find()
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


