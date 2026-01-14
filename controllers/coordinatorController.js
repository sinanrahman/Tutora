const Coordinator = require('../models/Coordinator');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Session = require('../models/Session');

const getTodayRange = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return { start, end };
};

//      RENDER COORDINATOR DASHBOARD
exports.coordinatorDashboard = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.render('auth/pageNotFound', { msg: 'Error: You must be logged in as a coordinator' });
        }

        const coordinatorId = req.user.id;

        const coord = await Coordinator.findById(coordinatorId);
        if (!coord) {
            return res.render('auth/pageNotFound', { msg: 'Error: Coordinator not found' });
        }

        const students = await Student.find({ coordinator: coordinatorId }).populate(
            'assignedTeachers',
            'fullName'
        );

        const teachers = await Teacher.find().select('_id fullName subjects');

        const { start, end } = getTodayRange();

        // Optional: Aggregation logic for teacherUsage can go here

        return res.render('coordinator/dashboard', {
            coord,
            students,
            teachers,
            activePage: "dashboard",
            username: coord.fullName
        });
    } catch (err) {
        console.error(err);
        return res.render('auth/pageNotFound', { msg: 'Server error while loading dashboard' });
    }
};

//      GET ASSIGNED STUDENTS
exports.getAssignedStudents = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.render('auth/pageNotFound', { msg: 'Error: You must be logged in as a coordinator' });
        }

        const coord = await Coordinator.findById(req.user.id);
        if (!coord) {
            return res.render('auth/pageNotFound', { msg: 'Error: Coordinator not found' });
        }

        const students = await Student.find({
            coordinator: coord._id,
        })
            .populate('assignedTeachers', 'fullName')
            .sort({ createdAt: -1 });

        return res.render('coordinator/dashboard', { students, coord, teachers: [] });
    } catch (err) {
        console.error(err);
        return res.render('auth/pageNotFound', { msg: 'Error loading assigned students' });
    }
};

//      GET STUDENT PROFILE
exports.getStudentProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.render('auth/pageNotFound', { msg: 'Error: You must be logged in as a coordinator' });
        }

        const coord = await Coordinator.findById(req.user.id);
        if (!coord) {
            return res.render('auth/pageNotFound', { msg: 'Error: Coordinator not found' });
        }

        const student = await Student.findOne({
            _id: req.params.id,
            coordinator: coord._id,
        }).populate('assignedTeachers', 'fullName email');

        if (!student) {
            return res.render('auth/pageNotFound', { msg: 'Error: Access denied or student not found' });
        }

        const sessions = await Session.find({
            student: student._id,
            status: 'APPROVED',
        }).select('durationInHours');

        let totalHours = 0;

        sessions.forEach((session) => {
            totalHours += session.durationInHours;
        });

        return res.render('coordinator/student-profile', {
            student,
            coord,
            totalHours,
            activePage: "student-profile",
            username: coord.fullName
        });
    } catch (err) {
        console.error(err);
        return res.render('auth/pageNotFound', { msg: 'Error loading student profile' });
    }
};

//      ASSIGN TEACHERS TO STUDENT
exports.assignTeachers = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { teachers } = req.body;
        
        if (!teachers || teachers.length !== 4) {
            return res.render('auth/pageNotFound', { msg: 'Error: Exactly 4 teachers are required' });
        }

        const { start, end } = getTodayRange();

        for (const teacherId of teachers) {
            const teacher = await Teacher.findById(teacherId);
            const uniqueStudentsToday = await Session.distinct('student', {
                teacher: teacherId,
                date: { $gte: start, $lte: end },
                status: 'APPROVED',
            });

            if (uniqueStudentsToday.length >= teacher.dailyHourLimit) {
                return res.render('auth/pageNotFound', { msg: `Error: ${teacher.fullName} has reached today's teaching limit` });
            }
        }

        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            { assignedTeachers: teachers },
            { new: true }
        );

        if (!updatedStudent) {
            return res.render('auth/pageNotFound', { msg: 'Error: Student not found for assignment' });
        }

        return res.redirect('/coordinator/assigned-students');
    } catch (err) {
        console.error(err);
        return res.render('auth/pageNotFound', { msg: 'Error assigning teachers' });
    }
};

//      RENDER SESSION APPROVAL PAGE
exports.getSessionApprovalPage = async (req, res) => {
    try {
        const coord = await Coordinator.findById(req.user.id);
        if (!coord) {
            return res.render('auth/pageNotFound', { msg: 'Error: Coordinator not found' });
        }

        const pendingSessions = await Session.find({
            status: 'PENDING',
        })
            .populate('student', 'fullName')
            .populate('teacher', 'fullName')
            .sort({ createdAt: -1 });

        const approvedSessions = await Session.find({
            status: 'APPROVED',
        })
            .populate('student', 'fullName')
            .populate('teacher', 'fullName')
            .sort({ updatedAt: -1 });

        return res.render('coordinator/session-approval', {
            coord,
            pendingSessions,
            approvedSessions,
            activePage: "session",
            username: coord.fullName
        });
    } catch (err) {
        console.error(err);
        return res.render('auth/pageNotFound', { msg: 'Error loading session approvals' });
    }
};

//      APPROVE SESSION
exports.approveSession = async (req, res) => {
    try {
        const { durationInHours } = req.body;

        const session = await Session.findById(req.params.id);
        if (!session) {
            // Keeping JSON here as this is likely an API/AJAX call
            return res.status(404).json({ error: 'Session not found' });
        }

        const duration = Number(durationInHours);
        if (isNaN(duration) || duration < 0) {
            return res.status(400).json({ error: 'Invalid duration' });
        }

        session.durationInHours = duration;
        session.status = 'APPROVED';
        await session.save();

        return res.json({ success: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
};

//      RENDER UPDATE TEACHER PAGE
exports.getUpdateTeacher = async(req,res) =>{
    try{
        const coord = await Coordinator.findById(req.user.id)
        const teachers = await Teacher.find()
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

//      ADD TEACHER TO STUDENT
exports.addUpdateTeacher = async (req, res) => {
    try {
        await Student.findByIdAndUpdate(req.params.studentId, {
            $addToSet: { assignedTeachers: req.params.teacherId }
        });

        return res.redirect(`/coordinator/update-teacher/${req.params.studentId}`);
    } catch (e) {
        console.log('error while assigning teacher', e);
        return res.redirect(`/coordinator/dashboard`);
    }
}

//      REMOVE TEACHER FROM STUDENT
exports.removeUpdateTeacher = async (req, res) => {
    try {
        await Student.findByIdAndUpdate(req.params.studentId, {
            $pull: { assignedTeachers: req.params.teacherId }
        });

        return res.redirect(`/coordinator/update-teacher/${req.params.studentId}`);
    } catch (e) {
        console.log('error while removing assigned teacher', e);
        return res.redirect(`/coordinator/dashboard`);
    }
}