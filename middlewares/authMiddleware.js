const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Coordinator = require('../models/Coordinator');

exports.protect = async (req, res, next) => {
	const token = req.cookies.token;
	if (!token) return res.redirect('/');

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		req.user = decoded;

		// If admin → fetch admin data
		if (decoded.role === 'ADMIN') {
			const admin = await Admin.findById(decoded.id);
			if (!admin) return res.redirect('/');

			// Make available to all EJS files
			res.locals.admin = admin;
		}
		//added
		if (decoded.role === 'TEACHER') {
			const teacher = await Teacher.findById(decoded.id);
			if (!teacher) return res.redirect('/');
			res.locals.user = teacher;
		}
		if (decoded.role === 'COORDINATOR') {
			const coordinator = await Coordinator.findById(decoded.id);
			if (!coordinator) return res.redirect('/');
			res.locals.user = coordinator;
		}
		if (decoded.role === 'PARENT') {
			const student = await Student.findById(decoded.id);
			if (!student) return res.redirect('/');

			res.locals.user = student;
		}
		next();
	} catch (err) {
		return res.redirect('/');
	}
};
