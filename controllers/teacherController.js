const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Salary = require('../models/Salary')
const Session = require('../models/Session');
const fileUploadToCloudinary = require('../utils/cloudinaryUpload');
const cloudinary = require('../config/cloudinary');
const mongoose = require('mongoose')

//      RENDER TEACHER DASHBOARD
exports.teacherDashboard = async (req, res) => {
    try {
        const teacherId = req.user.id;

        const teacher = await Teacher.findById(teacherId);

        const students = await Student.find({
            assignedTeachers: teacherId,
        })
            .populate('coordinator', 'fullName')
            .sort({ createdAt: -1 });

        return res.render('teacher/dashboard', {
            user: teacher,
            teacher,
            students,
            activePage: 'dashboard',
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
            activePage: 'dashboard',
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
            totalDuration:{
                $sum:'$durationInHours'
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
                totalPaid:{
                    $sum:'$amount'
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
const allSalary = await Salary.find({teacherId})
console.log("Total Earnings:", finalAmount);


        return res.render('teacher/profile', {
            user: teacher,
            teacher,
            activePage: 'profile',
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
            activePage: 'dashboard',
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