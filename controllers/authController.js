const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const sendEmail = require('../utils/sendEmail')
const Admin = require('../models/Admin')
const Teacher = require('../models/Teacher')
const Coordinator = require('../models/Coordinator')

const MAX_ATTEMPTS = 3
const LOCK_TIME = 1 * 60 * 1000

exports.loginPage = (req, res) => {
	res.render('auth/login')
}

exports.adminLoginPage = (req, res) => {
	res.render('auth/adminLogin', {
		msg: '',
		attemptsLeft: null,
		remainingTime: 0
	})
}


exports.teacherLoginPage = (req, res) => {
	res.render('auth/teacherLogin', { msg: '' })
}

exports.coordinatorLoginPage = (req, res) => {
	res.render('auth/coordinatorLogin', { msg: '' })
}

const renderLoginWithMsg = (
	res,
	role,
	msg,
	attemptsLeft = MAX_ATTEMPTS,
	remainingTime = 0
) => {
	if (role === 'admin') {
		return res.render('auth/adminLogin', {
			msg,
			attemptsLeft,
			remainingTime
		})
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
	try {
		const { email, password, role } = req.body
		let user
		let userRole

		if (role === 'admin') {
			user = await Admin.findOne({ email }).select('+password')

			if (!user) {
				return renderLoginWithMsg(
					res,
					role,
					'Invalid credentials',
					MAX_ATTEMPTS,
					0
				)
			}

			if (user.lockUntil && user.lockUntil > Date.now()) {
				const remainingTime = Math.ceil(
					(user.lockUntil - Date.now()) / 1000
				)

				return renderLoginWithMsg(res,role,
					'Too many attempts. Please wait.',0,
					remainingTime
				)
			}
			if (user.lockUntil && user.lockUntil <= Date.now()) {
				user.loginAttempts = 0
				user.lockUntil = null
				await user.save()
			}

			const isMatch = await bcrypt.compare(password, user.password)

			if (!isMatch) {
				user.loginAttempts += 1

				if (user.loginAttempts >= MAX_ATTEMPTS) {
					user.lockUntil = Date.now() + LOCK_TIME
				}

				await user.save()

				const attemptsLeft = Math.max(
					MAX_ATTEMPTS - user.loginAttempts,
					0
				)

				return renderLoginWithMsg(
					res,
					role,
					user.lockUntil
						? 'Too many attempts. Please wait.'
						: 'Wrong password',
					attemptsLeft,
					user.lockUntil
						? Math.ceil((user.lockUntil - Date.now()) / 1000)
						: 0
				)
			}

			user.loginAttempts = 0
			user.lockUntil = null
			await user.save()

			userRole = 'ADMIN'
		}

		if (role === 'teacher') {
			user = await Teacher.findOne({ email }).select('+password')

			if (!user || user.status !== 'active') {
				return renderLoginWithMsg(res, role, 'Invalid credentials')
			}

			const isMatch = await bcrypt.compare(password, user.password)
			if (!isMatch) {
				return renderLoginWithMsg(res, role, 'Wrong password')
			}

			userRole = 'TEACHER'
		}

		if (role === 'coordinator') {
			user = await Coordinator.findOne({ email }).select('+password')

			if (!user || !user.isActive) {
				return renderLoginWithMsg(res, role, 'Invalid credentials')
			}

			const isMatch = await bcrypt.compare(password, user.password)
			if (!isMatch) {
				return renderLoginWithMsg(res, role, 'Wrong password')
			}

			userRole = 'COORDINATOR'
		}

		if (!user) {
			return renderLoginWithMsg(res, role, 'User not found')
		}

		const token = jwt.sign(
			{
				id: user._id,
				role: userRole
			},
			process.env.JWT_SECRET,
			{ expiresIn: '1d' }
		)

		res.cookie('token', token, {
			httpOnly: true,
			sameSite: 'strict',
			secure: true,
		})

		if (userRole === 'ADMIN') return res.redirect('/admin/dashboard')
		if (userRole === 'TEACHER') return res.redirect('/teacher/dashboard')
		if (userRole === 'COORDINATOR') return res.redirect('/coordinator/dashboard')
	} catch (err) {
		console.error(err)
		res.status(500).send('Server error')
	}
}

exports.logout = (req, res) => {
	res.clearCookie('token')
	res.redirect('/')
}


// --- 1️⃣ Forgot Password ---
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    let user, role;

    if (user = await Admin.findOne({ email })) role = 'Admin';
    else if (user = await Teacher.findOne({ email })) role = 'Teacher';
    else if (user = await Coordinator.findOne({ email })) role = 'Coordinator';
    else return res.render('auth/forgotPassword', { msg: 'Email not found' });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save();

    // Use dynamic port
    const port = process.env.PORT || 3000;
    const resetURL = `http://localhost:${port}/reset-password/${resetToken}`;
    console.log('Reset URL:', resetURL); //  debug

    // Send email
    await sendEmail({
      to: user.email,
      subject: 'Password Reset',
      html: `<p>Hi ${role}, click <a href="${resetURL}">here</a> to reset your password. Link expires in 15 minutes.</p>`
    });

    res.render('auth/forgotPassword', { msg: 'Reset link sent' });
  } catch (err) {
    console.error(err);
    res.render('auth/forgotPassword', { msg: 'Error sending email' });
  }
};


// --- Render Reset Password Page ---
exports.renderResetPasswordPage = (req, res) => {
  try {
    console.log('RESET TOKEN:', req.params.token)

    res.render('auth/resetPassword', {
      token: req.params.token,
      msg: ''
    })
  } catch (err) {
    console.error('Render reset page error:', err)
    res.send('Error loading reset page')
  }
}


exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex')

    let user =
      (await Admin.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
      })) ||
      (await Teacher.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
      })) ||
      (await Coordinator.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
      }))

    if (!user) return res.send('Token invalid or expired')

    //  DO NOT HASH HERE
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined

    await user.save() // pre-save hook hashes once
    res.redirect('/')
  } catch (err) {
    console.error(err)
    res.send('Error resetting password')
  }
}

