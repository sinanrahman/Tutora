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
			activePage:"dashboard",
			username:coord.fullName
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

		res.render('coordinator/dashboard', { students, coord, teachers: [] });
	} catch (err) {
		console.error(err);
		res.status(500).send('Error loading assigned students');
	}
};

exports.getStudentProfile = async (req, res) => {
	try {
		if (!req.user || !req.user.id) {
			return res.status(401).send('You must be logged in as a coordinator');
		}

		const coord = await Coordinator.findById(req.user.id);
		if (!coord) return res.status(404).send('Coordinator not found');

		// Get the student only if assigned to this coordinator
		const student = await Student.findOne({
			_id: req.params.id,
			coordinator: coord._id,
		}).populate('assignedTeachers', 'fullName email');

		if (!student) {
			return res.status(403).send('Access denied');
		}

		const sessions = await Session.find({
			student: student._id,
			status: 'APPROVED',
		}).select('durationInHours');

		let totalHours = 0;

		sessions.forEach((session) => {
			totalHours += session.durationInHours;
		});

		res.render('coordinator/student-profile', {
			student,
			coord,
			totalHours,
			activePage:"student-profile",
			username:coord.fullName
		});
	} catch (err) {
		console.error(err);
		res.status(500).send('Error loading student profile');
	}
};

exports.assignTeachers = async (req, res) => {
	try {
		const { studentId } = req.params;
		const { teachers } = req.body;
		
		// console.log(teachers)

		if (!teachers || teachers.length !== 4) {
			return res.status(400).send('Exactly 4 teachers required');
		}

		const { start, end } = getTodayRange();

		// daily teacher limit

		for (const teacherId of teachers) {
			const teacher = await Teacher.findById(teacherId);
			console.log(teacher)
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

exports.getSessionApprovalPage = async (req, res) => {
	try {
		const coord = await Coordinator.findById(req.user.id);
		if (!coord) return res.status(404).send('Coordinator not found');

		const pendingSessions = await Session.find({ status: 'PENDING' })
			.populate('student', 'fullName')
			.populate('teacher', 'fullName')
			.sort({ createdAt: -1 });

		const approvedSessions = await Session.find({ status: { $in: ['APPROVED', 'REJECTED'] } })
			.populate('student', 'fullName')
			.populate('teacher', 'fullName')
			.sort({ updatedAt: -1 });

		res.render('coordinator/session-approval', {
			coord,
			pendingSessions,
			approvedSessions,
			activePage:"session",
			username:coord.fullName
		});
	} catch (err) {
		console.error(err);
		res.status(500).send('Error loading session approvals');
	}
};

exports.approveSession = async (req, res) => {
	try {
		const { action, durationInHours } = req.body;

		const session = await Session.findById(req.params.id);
		if (!session) {
			return res.status(404).send('Session not found');
		}

		if (action === 'approve') {
			if (!durationInHours || isNaN(durationInHours) || durationInHours < 0.25) {
				return res.status(400).send('Duration must be at least 0.25 hours');
			}
			session.durationInHours = Number(durationInHours);
			session.status = 'APPROVED';
		} else if (action === 'reject') {
			session.status = 'REJECTED';
		} else {
			return res.status(400).send('Invalid action');
		}

		await session.save();
		res.redirect('/coordinator/session-approval');
	} catch (err) {
		console.error(err);
		res.status(500).send('Error processing session');
	}
};

exports.getUpdateTeacher = async(req,res) =>{
	try{
		const coord = await Coordinator.findById(req.user.id)
		const teachers = await Teacher.find()
		// const assignedTeachers = await Student.findOne({_id:req.params.studentId}).select("assignedTeachers").populate('assignedTeachers')
		const { assignedTeachers } = await Student.findOne({ _id: req.params.studentId })
                                          .select("assignedTeachers")
                                          .populate('assignedTeachers');
		
		return res.render('coordinator/update-teacher',{
			activePage:'update-teacher',
			username:coord.fullName,
			t:teachers,
			assignedTeachers,
			studentId:req.params.studentId

		})
	}catch(e){
		console.log('error while rendering update teacher',e)
		return res.redirect(`/coordinator/dashboard`)
	}
}


exports.addUpdateTeacher = async (req, res) => {
    try {
        // $addToSet acts like push, but prevents duplicates
        await Student.findByIdAndUpdate(req.params.studentId, {
            $addToSet: { assignedTeachers: req.params.teacherId }
        });

        return res.redirect(`/coordinator/update-teacher/${req.params.studentId}`);
    } catch (e) {
        console.log('error while assigning teacher', e);
        return res.redirect(`/coordinator/dashboard`);
    }
}

exports.removeUpdateTeacher = async (req, res) => {
    try {
        // $pull removes the specific ID from the array
        await Student.findByIdAndUpdate(req.params.studentId, {
            $pull: { assignedTeachers: req.params.teacherId }
        });

        return res.redirect(`/coordinator/update-teacher/${req.params.studentId}`);
    } catch (e) {
        console.log('error while removing assigned teacher', e);
        return res.redirect(`/coordinator/dashboard`);
    }
}
