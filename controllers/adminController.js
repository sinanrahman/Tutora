const student = require('../models/Student');
const Session = require('../models/Session');

const Admin = require('../models/Admin');
const coordinator = require('../models/Coordinator');
const Teacher = require('../models/Teacher');
const cloudinary = require('../config/cloudinary');

exports.dashboard = async (req, res) => {
	try {
		const totalStudents = await student.countDocuments();
		const totalCoordinators = await coordinator.countDocuments();
		const totalTeachers = await Teacher.countDocuments();
		const totalActiveStudents = await student.countDocuments({ status: 'active' });
		const totalInactiveStudents = await student.countDocuments({ status: 'inactive' });
		const totalActiveCoordinators = await coordinator.countDocuments({ isActive: true });

		res.render('admin/dashboard', {
			totalStudents,
			totalCoordinators,
			totalTeachers,
			totalActiveStudents,
			totalInactiveStudents,
			totalActiveCoordinators,
			activePage: 'dashboard'
		});
	} catch (err) {
		console.log(err);
		res.send('Error loading dashboard');
	}
};

//students
exports.addStudents = async (req, res) => {
	return res.render('admin/addstudents');
};

exports.postAddStudent = async (req, res) => {
	const { fullname, email, phone, country, standard, gender, coordinator, status } = req.body;
	await student.create({
		fullName: fullname,
		email: email,
		phone: phone,
		country: country,
		standard: standard,
		gender: gender,
		status: status,
		coordinator: coordinator,
	});
	res.redirect('/admin/viewstudents');
};



exports.viewStudents = async (req, res) => {
  try {
    const Students = await student.find()
      .populate('coordinator', 'fullName email')
      .lean(); 

    const sessions = await Session.find({ status: 'APPROVED' })
      .select('student durationInHours');

    const hoursMap = {};

    sessions.forEach(session => {
      const studentId = session.student.toString();

      if (!hoursMap[studentId]) {
        hoursMap[studentId] = 0;
      }

      hoursMap[studentId] += session.durationInHours;
    });

    Students.forEach(student => {
      student.totalSessionHours = hoursMap[student._id.toString()] || 0;
    });

    res.render('admin/viewStudents', { students:Students,activePage: 'students' });

  } catch (err) {
    console.error(err);
    res.send('Error loading students');
  }
};

exports.editStudentPage = async (req, res) => {
	try {
		const id = req.params.id;
		const stud = await student.findById(id);
		const coordinators = await coordinator.find().select('_id fullName');

		if (!stud) return res.send('Student not found');
		res.render('admin/editStudent', { student: stud, coordinators });
	} catch (err) {
		console.log(err);
		res.send('Error loading edit page');
	}
};

exports.updateStudent = async (req, res) => {
	try {
		const id = req.params.id;
		const { fullname, email, phone, country, standard, gender, coordinator, status } = req.body;
		await student.findByIdAndUpdate(id, {
			fullName: fullname,
			email: email,
			phone: phone,
			country: country,
			standard: standard,
			status: status,
			gender: gender,
			coordinator: coordinator,
		});
		res.redirect('/admin/viewstudents');
	} catch (err) {
		console.log(err);
		res.send('Error updating student');
	}
};

exports.deleteStudent = async (req, res) => {
	try {
		const id = req.params.id;
		await student.findByIdAndDelete(id);
		res.redirect('/admin/viewstudents');
	} catch (err) {
		console.log(err);
		res.send('Error deleting student');
	}
};

//co-ordinators
exports.addCoordinators = (req, res) => {
	return res.render('admin/addCoordinators');
};

exports.postAddCoordinator = async (req, res) => {
	const { fullName, email, phone, password, status } = req.body;
	const admin = await Admin.findOne();
	if (!admin) {
		return res.send('No admin found. Create an admin first.');
	}
	await coordinator.create({
		fullName: fullName,
		email: email,
		phone: phone,
		password: password,
		status: status,
		createdBy: admin._id,
	});
	return res.redirect('/admin/viewcoordinators');
};

exports.viewCoordinator = async (req, res) => {
	try {
		const coordinators = await coordinator.find();
		return res.render('admin/viewCoordinators', { coordinators,activePage: 'coordinators' });
	} catch (err) {
		console.log(err);
		res.send('Error loading coordinators');
	}
};
exports.deleteCoordinator = async (req, res) => {
	try {
		const id = req.params.id;
		await coordinator.findByIdAndDelete(id);
		res.redirect('/admin/viewcoordinators');
	} catch (err) {
		console.log(err);
		res.send('Error deleting coordinator');
	}
};

exports.editCoordinatorPage = async (req, res) => {
	try {
		const id = req.params.id;
		const coord = await coordinator.findById(id);
		if (!coord) return res.send('Coordinator not found');
		res.render('admin/editCoordinator', { coord });
	} catch (err) {
		console.log(err);
		res.send('Error loading edit page');
	}
};

exports.updateCoordinator = async (req, res) => {
	try {
		const id = req.params.id;
		const { fullName, email, phone, status } = req.body;
		await coordinator.findByIdAndUpdate(id, {
			fullName,
			email,
			phone,
			status,
		});
		res.redirect('/admin/viewcoordinators');
	} catch (err) {
		console.log(err);
		res.send('Error updating coordinator');
	}
};

// teacher

exports.addTeacher = (req, res) => {
	res.render('admin/addTeachers');
};

exports.createTeacher = async (req, res) => {
	try {
		const {
			fullName,
			email,
			password,
			phone,
			experienceYears,
			hourlyRate,
			dailyStudents,
			subjects,
			degree,
			field,
			institution,
			status,
		} = req.body;

		if (!fullName || !email || !password || !subjects || !hourlyRate || !degree || !field) {
			return res.status(400).send('Required fields missing');
		}

		const existingTeacher = await Teacher.findOne({ email });
		if (existingTeacher) {
			return res.status(400).send('Teacher already exists');
		}

		let profilePic = {};

		if (req.files && req.files.profilePic) {
			const result = await cloudinary.uploader.upload(req.files.profilePic.tempFilePath, {
				folder: 'teachers',
			});
			profilePic = {
				url: result.secure_url,
				public_id: result.public_id,
			};
		}

		const formattedSubjects = subjects.split(',').map((s) => s.trim().toLowerCase());

		const teacher = new Teacher({
			fullName,
			email,
			password,
			phone,
			experienceYears,
			hourlyRate,
			dailyStudents,
			profilePic,
			status: status || 'active',
			qualification: {
				degree,
				field,
				institution,
			},
			subjects: formattedSubjects,
		});
		await teacher.save();
		res.redirect('/admin/viewteachers');
	} catch (error) {
		console.error('Create Teacher Error:', error);
		res.status(500).send(error.message);
	}
};

exports.getTeachers = async (req, res) => {
	try {
		const teachers = await Teacher.find().sort({ createdAt: -1 });

		res.render('admin/viewTeachers', {
			teachers,
			activePage:'teachers'
		});
	} catch (error) {
		console.error('Get Teachers Error:', error);
		res.status(500).send('Server Error');
	}
};

exports.getEditTeacher = async (req, res) => {
	try {
		const teacher = await Teacher.findById(req.params.id);
		if (!teacher) {
			return res.status(404).send('Teacher not found');
		}
		res.render('admin/editTeacher', {
			teacher,
		});
	} catch (error) {
		console.error('Get Edit Teacher Error:', error);
		res.status(500).send('Server Error');
	}
};

exports.updateTeacher = async (req, res) => {
	try {
		const teacher = await Teacher.findById(req.params.id);

		if (!teacher) {
			return res.status(404).send('Teacher not found');
		}

		const {
			fullName,
			email,
			phone,
			experienceYears,
			hourlyRate,
			dailyStudents,
			subjects,
			degree,
			field,
			institution,
			status,
		} = req.body;

		teacher.fullName = fullName;
		teacher.email = email;
		teacher.phone = phone;
		teacher.experienceYears = experienceYears;
		teacher.hourlyRate = hourlyRate;
		teacher.dailyStudents = dailyStudents;
		teacher.status = status;
		teacher.qualification = {
			degree,
			field,
			institution,
		};
		teacher.subjects = subjects
			.split(',')
			.map((s) => s.trim().toLowerCase())
			.filter(Boolean);
		if (req.files && req.files.profilePic) {
			if (teacher.profilePic?.public_id) {
				await cloudinary.uploader.destroy(teacher.profilePic.public_id);
			}
			const result = await cloudinary.uploader.upload(req.files.profilePic.tempFilePath, {
				folder: 'teachers',
			});
			teacher.profilePic = {
				url: result.secure_url,
				public_id: result.public_id,
			};
		}
		await teacher.save();
		res.redirect('/admin/viewteachers');
	} catch (error) {
		console.error('Update Teacher Error:', error);
		res.status(500).send('Server Error');
	}
};
exports.deleteTeacher = async (req, res) => {
	try {
		const teacher = await Teacher.findById(req.params.id);
		if (!teacher) {
			return res.status(404).send('Teacher not found');
		}
		if (teacher.profilePic?.public_id) {
			await cloudinary.uploader.destroy(teacher.profilePic.public_id);
		}
		await teacher.deleteOne();
		res.redirect('/admin/viewteachers');
	} catch (error) {
		console.error('Delete Teacher Error:', error);
		res.status(500).send('Server Error');
	}
};

//assigning
exports.assignStudentsPage = async (req, res) => {
  try {
    const coordinatorId = req.params.id;

    const coord = await coordinator
      .findById(coordinatorId)
      .populate("assignedStudents");

    if (!coord) {
      return res.send("Coordinator not found");
    }
    const allStudents = await student.find({ status: 'active' });

    const studentsToShow = [];
    for (const s of allStudents) {
      if (!s.coordinator) {
        studentsToShow.push(s);
      } 
      else if (s.coordinator.toString() === coordinatorId.toString()) {
        studentsToShow.push(s);
      }
    }

    res.render("admin/assignstudents", {
      coord,
      students: studentsToShow
    });

  } catch (err) {
    console.log(err);
    res.send("Error loading assign page");
  }
};

exports.assignStudents = async (req, res) => {
	try {
		const coordinatorId = req.params.id;
		let selectedStudents = req.body.students;
		if (!selectedStudents) {
			return res.redirect(`/admin/assignstudents/${coordinatorId}`);
		}
		if (!Array.isArray(selectedStudents)) {
			selectedStudents = [selectedStudents];
		}
		const currentlyAssigned = await student.find({ coordinator: coordinatorId });

		for (const s of currentlyAssigned) {
			s.coordinator = null;
			await s.save();
		}
		const assignedIds = [];

		for (const id of selectedStudents) {
			const s = await student.findById(id);

			if (!s) continue;
			if (s.coordinator && s.coordinator.toString() !== coordinatorId.toString()) {
				continue;
			}

			s.coordinator = coordinatorId;
			await s.save();

			assignedIds.push(s._id);
		}
		const coord = await coordinator.findById(coordinatorId);
		coord.assignedStudents = assignedIds;
		await coord.save();

		res.redirect(`/admin/assignstudents/${coordinatorId}`);
	} catch (err) {
		console.log(err);
		res.send('Error assigning students');
	}
};

exports.removeAssignedStudent = async (req, res) => {
	try {
		const { coordId, studentId } = req.params;
		const coord = await coordinator.findById(coordId);
		coord.assignedStudents = coord.assignedStudents.filter((id) => id.toString() !== studentId);
		await coord.save();
		const stu = await student.findById(studentId);
		stu.coordinator = null;
		await stu.save();

		res.redirect(`/admin/assignstudents/${coordId}`);
	} catch (err) {
		console.log(err);
		res.send('Error removing student');
	}
};

exports.changeCoordinatorPassword = async (req, res) => {
	try {
		const { id } = req.params;
		const { password } = req.body;

		if (!password || password.length < 8) {
			return res.redirect('/admin/viewcoordinators');
		}

		const Coordinator = await coordinator.findById(id).select('+password');

		if (!Coordinator) {
			return res.redirect('/admin/viewcoordinators');
		}

		Coordinator.password = password;
		await Coordinator.save();
		console.log('coordinator password changed');

		res.redirect('/admin/viewcoordinators');
	} catch (error) {
		console.error('Change password error:', error);
		res.redirect('/admin/viewcoordinators');
	}
};

exports.changeTeacherPassword = async (req, res) => {
	try {
		const { id } = req.params;
		const { password } = req.body;
		if (!password || password.length < 8) {
			return res.redirect('/admin/viewteachers');
		}

		const teacher = await Teacher.findById(id);

		if (!teacher) {
			return res.redirect('/admin/viewteachers');
		}
		teacher.password = password;
		await teacher.save();

		res.redirect('/admin/viewteachers');
	} catch (error) {
		console.error('Teacher password change error:', error);
		res.redirect('/admin/viewteachers');
	}
};
