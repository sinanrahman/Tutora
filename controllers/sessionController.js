const Session = require('../models/Session');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

/**
 * TEACHER → Submit Session
 */
exports.submitSession = async (req, res) => {
	try {
		const { student, type, date, durationInHours } = req.body;

		await Session.create({
			student,
			teacher: req.user.id,
			type,
			date,
			durationInHours,
		});

		res.redirect('/teacher/dashboard');
	} catch (error) {
		console.error(error);
		res.status(500).send('Session submission failed');
	}
};

/**
 * COORDINATOR → Approve Session
 */
exports.approveSession = async (req, res) => {
	try {
		const session = await Session.findById(req.params.id).populate('teacher').populate('student');

		if (!session || session.status === 'APPROVED') {
			return res.redirect('/coordinator/dashboard');
		}

		const { teacher, student, durationInHours, type } = session;

		if (student.remainingHours < durationInHours) {
			return res.send('Student has insufficient prepaid hours');
		}

		let hourlyRate = 0;

		if (type === 'EXAM') {
			hourlyRate = 100;
		} else {
			let multiplier = 1;

			if (teacher.experienceYears >= 5) multiplier = 1.5;
			else if (teacher.experienceYears >= 2) multiplier = 1.2;

			hourlyRate = teacher.hourlyRate * multiplier;
		}

		const total = hourlyRate * durationInHours;

		// update records
		session.studentCharge = total;
		session.teacherEarning = total;
		session.status = 'APPROVED';
		session.approvedBy = req.user.id;

		student.remainingHours -= durationInHours;

		await student.save();
		await session.save();

		res.redirect('/coordinator/dashboard');
	} catch (error) {
		console.error(error);
		res.status(500).send('Approval failed');
	}
};
