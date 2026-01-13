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
			user: teacher,
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
		const teacher = await Teacher.findById(req.user.id);

		const sessions = await Session.find({ teacher: req.user.id })
			.populate('student', 'fullName')
			.sort({ createdAt: -1 });

		res.render('teacher/sessionLists', {
			user: teacher,
			teacher,
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

    const teacher = await Teacher.findById(teacherId);

    const student = await Student.findById(req.query.studentId)

    // Get preselected student from query string
    const selectedStudentId = req.query.studentId || null;

    res.render('teacher/add-session', {
      user: teacher,
      teacher,
      student,
      selectedStudentId   // pass to EJS
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Unable to load add session page');
  }
};

exports.teacherProfilePage = async (req, res) => {
	try {
		const teacher = await Teacher.findById(req.user.id);

		if (!teacher) {
			return res.status(404).send('Teacher not found');
		}

		res.render('teacher/profile', {
			user: teacher,
			teacher,
		});
	} catch (err) {
		console.error(err);
		res.status(500).send('Unable to load profile');
	}
};
// View single student profile (for teacher)
exports.viewStudentProfile = async (req, res) => {
	try {
		const teacherId = req.user.id;
		const studentId = req.params.id;

		// Find student assigned to this teacher
		const student = await Student.findOne({
			_id: studentId,
			assignedTeachers: teacherId,
		})
			.populate('coordinator', 'fullName email')
			.populate('assignedTeachers', 'fullName subjects')
			.lean();

		if (!student) {
			return res.status(403).send('Access denied or student not found');
		}

		// Calculate total attended hours (only approved sessions)
		const sessions = await Session.find({
			student: studentId,
			status: 'APPROVED',
		}).select('durationInHours');

		let totalHours = 0;
		sessions.forEach(s => {
			totalHours += s.durationInHours;
		});

		res.render('teacher/studentProfile', {
			user: req.user,
			student,
			totalHours,
		});
	} catch (err) {
		console.error(err);
		res.status(500).send('Error loading student profile');
	}
};
