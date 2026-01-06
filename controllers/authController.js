const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const Admin = require('../models/AdminModel')
const Teacher = require('../models/TeacherModel')
const Coordinator = require('../models/CoordinatorModel')
exports.loginPage = (req, res) => {
    return res.render('auth/login')
}

exports.adminLoginPage = (req, res) => {
    return res.render('auth/adminLogin')
}

exports.teacherLoginPage = (req, res) => {
    return res.render('auth/teacherLogin')
}

exports.coordinatorLoginPage = (req, res) => {
    return res.render('auth/coordinatorLogin')
}


exports.login = async (req, res) => {
	const {username, email, password, role } = req.body

	let user
	let userRole

	if (role === 'admin') {
		user = await Admin.findOne({ email }).select('+password')
		if (!user || user.status !== 'active') {
			return res.status(401).send('Admin not active')
		}
		userRole = 'ADMIN'
	}

	if (role === 'teacher') {
		user = await Teacher.findOne({ email })
		if (!user || user.status !== 'active') {
			return res.status(401).send('Teacher not active')
		}
		userRole = 'TEACHER'
	}

	if (role === 'coordinator') {
		user = await Coordinator.findOne({ email })
		if (!user || !user.isActive) {
			return res.status(401).send('Coordinator not active')
		}
		userRole = 'COORDINATOR'
	}

	if (!user) {
		return res.status(401).send('Invalid credentials')
	}

	const isMatch = await bcrypt.compare(password, user.password)
	if (!isMatch) {
		return res.status(401).send('Invalid credentials')
	}

	const token = jwt.sign(
		{
			id: user._id,
			role: userRole,
		},
		process.env.JWT_SECRET,
		{ expiresIn: '1d' }
	)

	res.cookie('token', token, {
		httpOnly: true,
		sameSite: 'strict',
	})

	if (userRole === 'ADMIN') return res.redirect('/admin/dashboard')
	if (userRole === 'TEACHER') return res.redirect('/teacher/dashboard')
	if (userRole === 'COORDINATOR') return res.redirect('/coordinator/dashboard')
}

exports.logout = (req, res) => {
	res.clearCookie('token')
	res.redirect('/')
}
