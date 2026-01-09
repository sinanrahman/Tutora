const Coordinator = require('../models/Coordinator');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Session = require('../models/Session');

/**
 * Coordinator Dashboard
 */

const getTodayRange = () => {
	const start = new Date();
	start.setHours(0, 0, 0, 0);

	const end = new Date();
	end.setHours(23, 59, 59, 999);

	return { start, end };
};

exports.coordinatorDashboard = async (req, res) => {
	try {
		if (!req.user || !req.user.id) {
			return res.status(401).send('You must be logged in as a coordinator');
		}

		const coordinatorId = req.user.id;

		const coord = await Coordinator.findById(coordinatorId);
		if (!coord) {
			return res.status(404).send('Coordinator not found');
		}

		const students = await Student.find({ coordinator: coordinatorId }).populate(
			'assignedTeachers',
			'fullName'
		);

		const teachers = await Teacher.find().select('_id fullName subjects');

		// 🔹 DAILY USAGE LOGIC
		const { start, end } = getTodayRange();

		const teacherUsage = await Session.aggregate([
			{
				$match: {
					date: { $gte: start, $lte: end },
					status: 'APPROVED', // optional but recommended
				},
			},
			{
				$group: {
					_id: {
						teacher: '$teacher',
						student: '$student',
					},
				},
			},
			{
				$group: {
					_id: '$_id.teacher',
					count: { $sum: 1 },
				},
			},
		]);

		res.render('coordinator/dashboard', {
			coord,
			students,
			teachers,
		});
	} catch (err) {
		console.error(err);
		res.status(500).send('Server error while loading dashboard');
	}
};

/**
 * Assigned Students Page
 */
exports.getAssignedStudents = async (req, res) => {
	try {
		if (!req.user || !req.user.id) {
			return res.status(401).send('You must be logged in as a coordinator');
		}

		const coord = await Coordinator.findById(req.user.id);
		if (!coord) return res.status(404).send('Coordinator not found');

		const students = await Student.find({
			coordinator: coord._id,
		})
			.populate('assignedTeachers', 'fullName')
			.sort({ createdAt: -1 });

		res.render('coordinator/assigned-students', { students, coord });
	} catch (err) {
		console.error(err);
		res.status(500).send('Error loading assigned students');
	}
};

/**
 * Student Profile
 */
exports.getStudentProfile = async (req, res) => {
	try {
		if (!req.user || !req.user.id) {
			return res.status(401).send('You must be logged in as a coordinator');
		}

		const coord = await Coordinator.findById(req.user.id);
		if (!coord) return res.status(404).send('Coordinator not found');

		const student = await Student.findOne({
			_id: req.params.id,
			coordinator: coord._id,
		}).populate('assignedTeachers', 'fullName email');

		if (!student) {
			return res.status(403).send('Access denied');
		}

		res.render('coordinator/student-profile', { student, coord });
	} catch (err) {
		console.error(err);
		res.status(500).send('Error loading student profile');
	}
};

/**
 * Assign 4 Teachers to Student
 */
exports.assignTeachers = async (req, res) => {
	try {
		const { studentId } = req.params;
		const { teachers } = req.body;

		if (!teachers || teachers.length !== 4) {
			return res.status(400).send('Exactly 4 teachers required');
		}

		const { start, end } = getTodayRange();

		// daily teacher limit

		for (const teacherId of teachers) {
			const teacher = await Teacher.findById(teacherId);

			const uniqueStudentsToday = await Session.distinct('student', {
				teacher: teacherId,
				date: { $gte: start, $lte: end },
				status: 'APPROVED',
			});

			if (uniqueStudentsToday.length >= teacher.dailyHourLimit) {
				return res.status(400).send(`${teacher.fullName} reached today's teaching limit`);
			}
		}

		// Atomic update (NO VersionError)
		const updatedStudent = await Student.findByIdAndUpdate(
			studentId,
			{ assignedTeachers: teachers },
			{ new: true }
		);

		if (!updatedStudent) {
			return res.status(404).send('Student not found');
		}

		res.redirect('/coordinator/assigned-students');
	} catch (err) {
		console.error(err);
		res.status(500).send('Error assigning teachers');
	}
};
