const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const Admin = require('../models/Admin')
const Teacher = require('../models/Teacher')
const Coordinator = require('../models/Coordinator')
exports.loginPage = (req, res) => {
    return res.render('auth/login')
}

exports.adminLoginPage = (req, res) => {
    return res.render('auth/adminLogin',{msg:''})
}

exports.teacherLoginPage = (req, res) => {
    return res.render('auth/teacherLogin',{msg:''})
}

exports.coordinatorLoginPage = (req, res) => {
    return res.render('auth/coordinatorLogin',{msg:''})
}

const renderLoginWithMsg = (res, role, msg) => {
	if (role === 'admin') {
		return res.render('auth/adminLogin', { msg })
	}
	if (role === 'teacher') {
		return res.render('auth/teacherLogin', { msg })
	}
	if (role === 'coordinator') {
		return res.render('auth/coordinatorLogin', { msg })
	}
	return res.render('auth/login', { msg })
}


exports.login = async (req, res) => {
	const {username, email, password, role } = req.body

	let user
	let userRole

	if (role === 'admin') {
		user = await Admin.findOne({ email }).select('+password')
		if (!user || user.status !== 'active') {
			return renderLoginWithMsg(res, role, 'Incorrect email or password')
		}
		userRole = 'ADMIN'
	}

	if (role === 'teacher') {
		user = await Teacher.findOne({ email })
		if (!user || user.status !== 'active') {
			return renderLoginWithMsg(res, role, 'Incorrect email or password')
		}
		userRole = 'TEACHER'
	}

	if (role === 'coordinator') {
		user = await Coordinator.findOne({ email })
		if (!user || !user.isActive) {
			return renderLoginWithMsg(res, role, 'Incorrect email or password')
		}
		userRole = 'COORDINATOR'
	}

	if (!user) {
		return renderLoginWithMsg(res, role, 'User not found')
	}

	const isMatch = await bcrypt.compare(password, user.password)
		if (!isMatch) {
		return renderLoginWithMsg(res, role, 'Invalid credentials')
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
		sameSite: 'none',
		secure:'true'
	})

	if (userRole === 'ADMIN') return res.redirect('/admin/dashboard')
	if (userRole === 'TEACHER') return res.redirect('/teacher/dashboard')
	if (userRole === 'COORDINATOR') return res.redirect('/coordinator/dashboard')
}

exports.logout = (req, res) => {
	res.clearCookie('token')
	res.redirect('/')
}
