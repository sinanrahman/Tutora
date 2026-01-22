const sidebarMenu = require('../config/sidebarMenu');
const Teacher = require('../models/Teacher');
const Coordinator = require('../models/Coordinator');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

exports.setSidebarMenu = async (req, res, next) => {
	// 1. Ensure res.locals.user exists by copying req.user or creating an empty object
	res.locals.user = req.user ? { ...req.user } : {};

	if (req.user?.role) {
		res.locals.role = req.user.role;
		res.locals.roleCapitalized =
			req.user.role.charAt(0) + req.user.role.slice(1).toLowerCase();

		res.locals.dp = false;
		if (req.user.role == 'TEACHER') {
			try {
				// 2. Fetch the teacher document
				const teacherDoc = await Teacher.findById(req.user.id).select('profilePic fullName');

				// 3. Assign ONLY the profilePic field to 'dp'

				if (teacherDoc && teacherDoc.profilePic) {
					res.locals.dp = teacherDoc.profilePic.url;
					// console.log(res.locals.user.dp)
					res.locals.user.fullName = teacherDoc.fullName;
				}
			} catch (err) {
				console.error('Error fetching teacher profile pic:', err);
			}
		}
		// coordinator
		if (req.user.role === 'COORDINATOR') {
			try {
				const coordinator = await Coordinator.findById(req.user.id).select('fullName');

				if (coordinator) {
					res.locals.user.fullName = coordinator.fullName;
				}
			} catch (err) {
				console.error('Error fetching coordinator:', err);
			}
		}

		// admin
		if (req.user.role === 'ADMIN') {
			try {
				const admin = await Admin.findById(req.user.id).select('username');

				if (admin) {
					res.locals.user.fullName = admin.username;
				}
			} catch (err) {
				console.error('Error fetching admin:', err);
			}
		}
		if (req.user.role === 'PARENT') {

			const student = await Student.findById(req.user.id).select('parentEmail');
			if (student) {
				res.locals.user.fullName = student.parentEmail;
			}
		}

		res.locals.menu = sidebarMenu[req.user.role] || [];
	} else {
		res.locals.menu = [];
	}

	next();
};
