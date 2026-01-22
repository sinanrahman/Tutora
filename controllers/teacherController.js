const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Salary = require('../models/Salary')
const Session = require('../models/Session');
const fileUploadToCloudinary = require('../utils/cloudinaryUpload');
const cloudinary = require('../config/cloudinary');
const mongoose = require('mongoose')


exports.dashboard = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const teacher = await Teacher.findById(teacherId);

        // 1️⃣ Total Students
        const totalStudents = await Student.countDocuments({
            assignedTeachers: teacherId
        });

        // 2️⃣ Pending Sessions
        const pendingSessions = await Session.countDocuments({
            teacher: teacherId,
            status: 'PENDING'
        });

        // 3️⃣ Total Earnings from approved sessions
        const sessions = await Session.find({
            teacher: teacherId,
            status: 'APPROVED'
        }).select('durationInHours');

        let totalEarnings = 0;
        let totalDuration = 0;

        sessions.forEach((s) => {
            totalEarnings += s.durationInHours * teacher.hourlyRate;
            totalDuration += s.durationInHours;
        });

        // 4️⃣ Total Paid Salary
        const allSalaries = await Salary.find({ teacherId: teacherId }).select('amount');
        const totalPaid = allSalaries.reduce((sum, s) => sum + s.amount, 0);

        // 5️⃣ Pending Salary
        const pendingSalary = totalEarnings - totalPaid;

        res.render('teacher/dashboard', {
            totalStudents,
            pendingSessions,
            totalSalaryPaid: totalPaid,
            pendingSalary,
            activePage: 'dashboard'
        });

    } catch (err) {
        console.error(err);
        res.render('auth/pageNotFound', {
            msg: 'Error loading teacher dashboard'
        });
    }
};




exports.viewStudents = async (req, res) => {
    try {
        const teacherId = req.user.id;

        const teacher = await Teacher.findById(teacherId);

        const students = await Student.find({
            assignedTeachers: teacherId,
        })
            .populate('coordinator', 'fullName')
            .sort({ createdAt: -1 });

        return res.render('teacher/students', {
            user: teacher,
            teacher,
            students,
            activePage: 'students',
        });
    } catch (err) {
        console.error(err);
        return res.render('auth/pageNotFound', { msg: 'Error: Unable to load teacher dashboard' });
    }
};



//      RENDER TEACHER SESSIONS LIST
exports.teacherSessionsPage = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.user.id);

        const sessions = await Session.find({ teacher: req.user.id })
            .populate('student', 'fullName')
            .sort({ createdAt: -1 });

        return res.render('teacher/sessionLists', {
            user: teacher,
            teacher,
            sessions,
            activePage: 'sessions',
        });
    } catch (err) {
        console.error(err);
        return res.render('auth/pageNotFound', { msg: 'Error: Unable to load sessions list' });
    }
};

//      RENDER ADD SESSION PAGE
exports.addSessionPage = async (req, res) => {
    try {
        const teacherId = req.user.id;

        const teacher = await Teacher.findById(teacherId);

        const student = await Student.findById(req.query.studentId);

        const selectedStudentId = req.query.studentId || null;

        return res.render('teacher/add-session', {
            user: teacher,
            teacher,
            student,
            selectedStudentId,
            activePage: 'students',
        });
    } catch (err) {
        console.error(err);
        return res.render('auth/pageNotFound', { msg: 'Error: Unable to load add session page' });
    }
};

//      RENDER TEACHER PROFILE
exports.teacherProfilePage = async (req, res) => {
    try {
        const teacherId = req.user.id
        const teacher = await Teacher.findById(teacherId);

        if (!teacher) {
            return res.render('auth/pageNotFound', { msg: 'Error: Teacher profile not found' });
        }

        //      PENDING SALARY CALCULATIONS
        // const allApprovedSessionsOfTeacher = await Session.find({teacher:teacherId,status:'APPROVED'}) 

        const result = await Session.aggregate([
            {
                // 1. Filter: Find approved sessions for this teacher
                $match: {
                    teacher: new mongoose.Types.ObjectId(teacherId), // IMPORTANT: Cast string ID to ObjectId
                    status: 'APPROVED'
                }
            },
            {
                // 2. Calculate: Multiply duration * rate for each doc, then sum them all
                $group: {
                    _id: null, // We want one single result, not groups
                    totalEarnings: {
                        $sum: { $multiply: ["$durationInHours", teacher.hourlyRate] }
                    },
                    totalDuration: {
                        $sum: '$durationInHours'
                    }
                }
            }
        ]);
        let allPaidSalary = await Salary.aggregate([
            {
                // 1. Filter: Find approved sessions for this teacher
                $match: {
                    teacherId: new mongoose.Types.ObjectId(teacherId), // IMPORTANT: Cast string ID to ObjectId
                }
            },
            {
                // 2. Calculate: Multiply duration * rate for each doc, then sum them all
                $group: {
                    _id: null, // We want one single result, not groups
                    totalPaid: {
                        $sum: '$amount'
                    }
                }
            }
        ])
        // result will be an array like: [ { _id: null, totalEarnings: 5500 } ]
        allPaidSalary = allPaidSalary.length > 0 ? allPaidSalary[0].totalPaid : 0;
        let finalAmount = result.length > 0 ? result[0].totalEarnings : 0;
        // const totalDuration = result.length > 0 ? result[0].totalDuration : 0;
        finalAmount = finalAmount - allPaidSalary
        // result will be an array like: [ { _id: null, totalEarnings: 5500 } ]
        // const finalAmount = result.length > 0 ? result[0].totalEarnings : 0;
        const totalDuration = result.length > 0 ? result[0].totalDuration : 0;
        const allSalary = await Salary.find({ teacherId })


        return res.render('teacher/profile', {
            user: teacher,
            teacher,
            activePage: 'teacherProfile',
            pendingSalary: finalAmount,
            totalDuration,
            allSalary,
            allPaidSalary
        });
    } catch (err) {
        console.error(err);
        return res.render('auth/pageNotFound', { msg: 'Error: Unable to load profile' });
    }
};

//      RENDER SINGLE STUDENT PROFILE FOR TEACHER
exports.viewStudentProfile = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const studentId = req.params.id;

        const student = await Student.findOne({
            _id: studentId,
            assignedTeachers: teacherId,
        })
            .populate('coordinator', 'fullName email')
            .populate('assignedTeachers', 'fullName subjects')
            .lean();

        if (!student) {
            return res.render('auth/pageNotFound', { msg: 'Error: Access denied or student not found' });
        }

        const sessions = await Session.find({
            student: studentId,
            status: 'APPROVED',
        }).select('durationInHours');

        let totalHours = 0;
        sessions.forEach((s) => {
            totalHours += s.durationInHours;
        });
        const teacher = await Teacher.findById(req.user.id);

        return res.render('teacher/studentProfile', {
            user: teacher,
            student,
            totalHours,
            activePage: 'students',
        });
    } catch (err) {
        console.error(err);
        return res.render('auth/pageNotFound', { msg: 'Error: Unable to load student profile' });
    }
};

//      UPDATE PROFILE PICTURE
exports.updateProfilePic = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.user.id);

        if (!teacher) {
            return res.render('auth/pageNotFound', { msg: 'Error: Teacher not found' });
        }

        // Check if a file was actually uploaded
        if (!req.files || !req.files.profilePic) {
            // If no file selected, just redirect back to profile
            return res.redirect('/teacher/profile');
        }

        // 1. Delete old image from Cloudinary if it exists
        if (teacher.profilePic && teacher.profilePic.public_id) {
            await cloudinary.uploader.destroy(teacher.profilePic.public_id);
        }

        // 2. Upload new image
        const newImage = await fileUploadToCloudinary(req.files.profilePic);

        // 3. Save new image data to database
        teacher.profilePic = newImage;
        await teacher.save();

        return res.redirect('/teacher/profile');

    } catch (e) {
        console.log(e);
        return res.render('auth/pageNotFound', { msg: 'Error: Unable to update profile picture' });
    }
};

// exports.pendingSalaryCalculator = async(req,res){
//     try{
//         const 
//     }catch(e){
//         console.log(e)
//         return res.render('auth/pageNotFound', { msg: 'Error while calculating teacher salary' })
//     }
// }

// RENDER PENDING SALARY PAGE
exports.viewPendingSalaryPage = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const teacher = await Teacher.findById(teacherId);

        // Total Approved Sessions Earnings
        const result = await Session.aggregate([
            {
                $match: {
                    teacher: new mongoose.Types.ObjectId(teacherId),
                    status: 'APPROVED'
                }
            },
            {
                $group: {
                    _id: null,
                    totalEarnings: {
                        $sum: { $multiply: ["$durationInHours", teacher.hourlyRate] }
                    },
                    totalDuration: { $sum: "$durationInHours" }
                }
            }
        ]);

        // Total Paid Salary
        let paid = await Salary.aggregate([
            {
                $match: {
                    teacherId: new mongoose.Types.ObjectId(teacherId)
                }
            },
            {
                $group: {
                    _id: null,
                    totalPaid: { $sum: "$amount" }
                }
            }
        ]);

        const totalPaid = paid.length > 0 ? paid[0].totalPaid : 0;
        const totalEarnings = result.length > 0 ? result[0].totalEarnings : 0;
        const totalDuration = result.length > 0 ? result[0].totalDuration : 0;

        const pendingSalary = totalEarnings - totalPaid;
        const allSalary = await Salary.find({ teacherId }).sort({ paidDate: -1 });

        return res.render('teacher/pendingSalary', {
            user: teacher,
            teacher,
            pendingSalary,
            totalDuration,
            totalPaid,
            totalEarnings,
            allSalary,
            allPaidSalary: totalPaid,
            activePage: 'teacherProfile'
        });

    } catch (err) {
        console.error(err);
        return res.render('auth/pageNotFound', {
            msg: 'Error: Unable to load pending salary page'
        });
    }
};
