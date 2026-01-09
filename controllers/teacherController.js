const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Session = require('../models/Session');

exports.teacherDashboard = async (req, res) => {
	try {
		const teacherId = req.user.id;

		const teacher = await Teacher.findById(teacherId);

		const students = await Student.find({
			assignedTeachers: teacherId,
		})
			.populate('coordinator', 'fullName')
			.sort({ createdAt: -1 });

		res.render('teacher/dashboard', {
			teacher,
			students,
		});
	} catch (err) {
		console.error(err);
		res.status(500).send('Error loading teacher dashboard');
	}
};
exports.teacherSessionsPage = async (req, res) => {
	try {
		const sessions = await Session.find({ teacher: req.user.id })
			.populate('student', 'fullName')
			.sort({ createdAt: -1 });

		res.render('teacher/sessionLists', {
			user: req.user,
			sessions,
		});
	} catch (err) {
		console.error(err);
		res.status(500).send('Unable to load sessions');
	}
};
// teacherController.js
exports.addSessionPage = async (req, res) => {
	try {
		const teacherId = req.user.id;

		// fetch students assigned to this teacher
		const students = await Student.find({ assignedTeachers: teacherId }).sort({ createdAt: -1 });

		res.render('teacher/add-session', {
			user: req.user,
			students,
		});
	} catch (err) {
		console.error(err);
		res.status(500).send('Unable to load add session page');
	}
};
