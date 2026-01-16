const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

//      IMPORTED MODELS
const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');
const Coordinator = require('../models/Coordinator');

const MAX_ATTEMPTS = 3;
const LOCK_TIME = 1 * 60 * 1000;

//      RENDER MAIN LOGIN PAGE
exports.loginPage = (req, res) => {
    return res.render('auth/login');
};

//      RENDER ADMIN LOGIN PAGE
exports.adminLoginPage = (req, res) => {
    try {
        return res.render('auth/adminLogin', {
            msg: '',
            attemptsLeft: null,
            remainingTime: 0,
        });
    } catch (error) {
        console.log(error);
        return res.render('auth/pageNotFound', { msg: 'Error loading admin login page' });
    }
};

//      RENDER TEACHER LOGIN PAGE
exports.teacherLoginPage = (req, res) => {
    try {
        return res.render('auth/teacherLogin', { msg: '' });
    } catch (error) {
        console.log(error);
        return res.render('auth/pageNotFound', { msg: 'Error loading teacher login page' });
    }
};

//      RENDER COORDINATOR LOGIN PAGE
exports.coordinatorLoginPage = (req, res) => {
    try {
        return res.render('auth/coordinatorLogin', { msg: '' });
    } catch (error) {
        console.log(error);
        return res.render('auth/pageNotFound', { msg: 'Error loading coordinator login page' });
    }
};

//      HELPER: RENDER LOGIN WITH ERROR MESSAGE
const renderLoginWithMsg = (res, role, msg, attemptsLeft = MAX_ATTEMPTS, remainingTime = 0) => {
    if (role === 'admin') {
        return res.render('auth/adminLogin', {
            msg,
            attemptsLeft,
            remainingTime,
        });
    }

    if (role === 'teacher') {
        return res.render('auth/teacherLogin', { msg });
    }

    if (role === 'coordinator') {
        return res.render('auth/coordinatorLogin', { msg });
    }

    return res.render('auth/login', { msg });
};

exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        let user;
        let userRole;

        if (role === 'admin') {
            user = await Admin.findOne({ email }).select('+password');

            if (!user) {
                return renderLoginWithMsg(res, role, 'Invalid credentials', MAX_ATTEMPTS, 0);
            }

            if (user.lockUntil && user.lockUntil > Date.now()) {
                const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000);
                return renderLoginWithMsg(res, role, 'Too many attempts. Please wait.', 0, remainingTime);
            }
            if (user.lockUntil && user.lockUntil <= Date.now()) {
                user.loginAttempts = 0;
                user.lockUntil = null;
                await user.save();
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                user.loginAttempts += 1;

                if (user.loginAttempts >= MAX_ATTEMPTS) {
                    user.lockUntil = Date.now() + LOCK_TIME;
                }

                await user.save();

                const attemptsLeft = Math.max(MAX_ATTEMPTS - user.loginAttempts, 0);

                return renderLoginWithMsg(
                    res,
                    role,
                    user.lockUntil ? 'Too many attempts. Please wait.' : 'Wrong password',
                    attemptsLeft,
                    user.lockUntil ? Math.ceil((user.lockUntil - Date.now()) / 1000) : 0
                );
            }

            user.loginAttempts = 0;
            user.lockUntil = null;
            await user.save();

            userRole = 'ADMIN';
        }

        if (role === 'teacher') {
            user = await Teacher.findOne({ email }).select('+password');

            if (!user || user.status !== 'teacher') {
                return renderLoginWithMsg(res, role, 'Invalid credentials');
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return renderLoginWithMsg(res, role, 'Wrong password');
            }

            userRole = 'TEACHER';
        }

        if (role === 'coordinator') {
            user = await Coordinator.findOne({ email }).select('+password');

            if (!user || user.status !== 'coordinator') {
                return renderLoginWithMsg(res, role, 'Invalid credentials');
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return renderLoginWithMsg(res, role, 'Wrong password');
            }

            userRole = 'COORDINATOR';
        }

        if (!user) {
            return renderLoginWithMsg(res, role, 'User not found');
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: userRole,
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'strict',
        });

        if (userRole === 'ADMIN') return res.redirect('/admin/dashboard');
        if (userRole === 'TEACHER') return res.redirect('/teacher/dashboard');
        if (userRole === 'COORDINATOR') return res.redirect('/coordinator/dashboard');
        
    } catch (err) {
        console.error(err);
        return res.render('auth/pageNotFound', { msg: 'Server error during login' });
    }
};

//      HANDLE LOGOUT
exports.logout = (req, res) => {
    res.clearCookie('token');
    return res.redirect('/');
};

//      HANDLE FORGOT PASSWORD REQUEST
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.render('auth/forgotPassword', {
                msg: 'Admin email not found',
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        admin.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        admin.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
        await admin.save();

        const port = process.env.PORT || 3000;
        const resetURL = `http://localhost:${port}/reset-password/${resetToken}`;

        await sendEmail({
            to: admin.email,
            subject: 'Admin Password Reset',
            html: `
            <p>Hello Admin,</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetURL}">${resetURL}</a>
            <p>This link expires in 15 minutes.</p>
        `,
        });

        return res.render('auth/forgotPassword', {
            msg: 'Password reset link sent to your email',
        });
    } catch (err) {
        console.error(err);
        return res.render('auth/pageNotFound', { msg: 'Error sending reset email' });
    }
};

//      RENDER RESET PASSWORD PAGE
exports.renderResetPasswordPage = async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const admin = await Admin.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!admin) {
            return res.render('auth/pageNotFound', { msg: 'Reset link is invalid or expired' });
        }

        return res.render('auth/resetPassword', {
            token: req.params.token,
            msg: '',
        });
    } catch (err) {
        console.error(err);
        return res.render('auth/pageNotFound', { msg: 'Error loading reset password page' });
    }
};

//      HANDLE RESET PASSWORD SUBMISSION
exports.resetPassword = async (req, res) => {
    try {
        const { password } = req.body;

        if (password.length < 8) {
            return res.render('auth/resetPassword', {
                token: req.params.token,
                msg: 'Password must be at least 8 characters long',
            });
        }

        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const admin = await Admin.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!admin) {
            return res.render('auth/pageNotFound', { msg: 'Reset link is invalid or expired' });
        }

        admin.password = password;
        admin.resetPasswordToken = undefined;
        admin.resetPasswordExpires = undefined;

        await admin.save();

        return res.redirect('/');
    } catch (err) {
        console.error(err);
        return res.render('auth/pageNotFound', { msg: 'Error processing password reset' });
    }
};