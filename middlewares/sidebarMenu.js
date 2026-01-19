const sidebarMenu = require('../config/sidebarMenu');
const Teacher = require('../models/Teacher');
const Coordinator = require('../models/Coordinator');


exports.setSidebarMenu = async (req, res, next) => {
	// 1. Ensure res.locals.user exists by copying req.user or creating an empty object
	res.locals.user = req.user ? { ...req.user } : {};

	if (req.user?.role) {
		res.locals.role = req.user.role;
		res.locals.roleCapitalized = res.locals.role.replace(
			res.locals.role.substring(1, res.locals.role.length),
			res.locals.role.substring(1, res.locals.role.length).toLowerCase()
		);
		res.locals.dp = false;
		if (req.user.role == 'TEACHER') {
			try {
				// 2. Fetch the teacher document
				const teacherDoc = await Teacher.findById(req.user.id).select('profilePic');

				// 3. Assign ONLY the profilePic field to 'dp'

				if (teacherDoc && teacherDoc.profilePic) {
					res.locals.dp = teacherDoc.profilePic.url;
					// console.log(res.locals.user.dp)
				}
			} catch (err) {
				console.error('Error fetching teacher profile pic:', err);
			}
		}
        //coordinator
		if (req.user.role === 'COORDINATOR') {
			const coordinator = await Coordinator.findById(req.user.id).select('fullName');

			if (coordinator) {
				res.locals.user.fullName = coordinator.fullName;
			}
		}

		res.locals.menu = sidebarMenu[req.user.role] || [];
	} else {
		res.locals.menu = [];
	}

	next();
};
