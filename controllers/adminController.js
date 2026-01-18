//      CLOUDINARY CONFIG
const fileUploadToCloudinary = require('../utils/cloudinaryUpload');
const cloudinary = require('../config/cloudinary');

//      IMPORTED MODELS
const Admin = require('../models/Admin');
const Coordinator = require('../models/Coordinator');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Session = require('../models/Session');
const Transaction = require("../models/Transaction");
const Invoice = require('../models/Invoice')

const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs'); // Import File System

//      RENDER ADMIN DASHBOARD
exports.dashboard = async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const totalCoordinators = await Coordinator.countDocuments();
        const totalTeachers = await Teacher.countDocuments();

        return res.render('admin/dashboard', {
            totalStudents,
            totalCoordinators,
            totalTeachers,
            activePage: 'dashboard',
        });
    } catch (err) {
        console.log(err);
        return res.render('auth/pageNotFound', { msg: 'Error while rendering dashboard' })
    }
};

//      RENDER ADMIN ADD STUDENTS
exports.addStudents = async (req, res) => {
    try {
        const coordinators = await Coordinator.find({ status: 'coordinator' }).select('_id fullName');
        return res.render('admin/addstudents', {
            coordinators,
            activePage: 'students',
        });
    } catch (err) {
        console.log(err);
        return res.render('auth/pageNotFound', { msg: 'Error loading Add Students page' })
    }
};

//      ADDING STUDENT DETAILS
exports.postAddStudent = async (req, res) => {
    await Student.create(req.body);
    return res.redirect('/admin/viewstudents');
};

//      RENDER VIEW STUDENT PAGE
exports.viewStudents = async (req, res) => {
    try {
        const Students = await Student.find().populate('coordinator', 'fullName email').lean();
        const sessions = await Session.find({ status: 'APPROVED' }).select('student durationInHours');
        const hoursMap = {};

        sessions.forEach((session) => {
            const studentId = session.student.toString();
            if (!hoursMap[studentId]) hoursMap[studentId] = 0;
            hoursMap[studentId] += session.durationInHours;
        });

        Students.forEach((student) => {
            student.totalSessionHours = hoursMap[student._id.toString()] || 0;
        });

        return res.render('admin/viewStudents', { students: Students, activePage: 'students' });
    } catch (err) {
        console.error(err);
        return res.render('auth/pageNotFound', { msg: 'Error loading View All Students page' })
    }
};

//      RENDER INDIVIDUAL STUDENT DETAILS PAGE
exports.viewStudentDetails = async (req, res) => {
    try {
        const studentId = req.params.id;
        const stud = await Student.findById(studentId).populate('coordinator', 'fullName email phone').lean();

        if (!stud) {
            return res.render('auth/pageNotFound', { msg: 'Error: Student not found' })
        }
        const sessions = await Session.find({
            student: studentId,
            status: 'APPROVED',
        }).select('durationInHours');

        const totalHours = sessions.reduce((sum, s) => sum + s.durationInHours, 0);
        stud.totalSessionHours = totalHours;
        return res.render('admin/viewStudentDetails', { student: stud, activePage: 'students' });
    } catch (err) {
        console.error(err);
        return res.render('auth/pageNotFound', { msg: 'Error loading student details' })
    }
};

//      RENDER EDIT STUDENT PAGE
exports.editStudentPage = async (req, res) => {
    try {
        const studentId = req.params.id;
        const stud = await Student.findById(studentId);
        const coordinators = await Coordinator.find({ status: 'coordinator' }).select('_id fullName');

        if (!stud) {
            return res.render('auth/pageNotFound', { msg: 'Student not found for editing' });
        }
        return res.render('admin/editStudent', { student: stud, coordinators, activePage: 'students' });
    } catch (err) {
        console.log(err);
        return res.render('auth/pageNotFound', { msg: 'Error loading Edit Student page' })
    }
};

//      EDITING / UPDATING STUDENT DETAILS
exports.updateStudent = async (req, res) => {
    try {
        const studentId = req.params.id;
        await Student.findByIdAndUpdate(studentId, req.body);
        return res.redirect('/admin/viewstudents');
    } catch (err) {
        console.log(err);
        return res.render('auth/pageNotFound', { msg: 'Error updating student details' })
    }
};

//      DELETING STUDENT
exports.deleteStudent = async (req, res) => {
    try {
        const id = req.params.id;
        await Student.findByIdAndDelete(id);
        return res.redirect('/admin/viewstudents');
    } catch (err) {
        console.log(err);
        return res.render('auth/pageNotFound', { msg: 'Error deleting student' })
    }
};

//      RENDERING ADD COORDINATORS PAGE
exports.addCoordinators = (req, res) => {
    return res.render('admin/addCoordinators', { activePage: 'coordinators' });
};

//      ADDING COORDINATOR 
exports.postAddCoordinator = async (req, res) => {
    try {
        const { fullName, email, phone, password, status } = req.body;
        const admin = await Admin.findOne();
        if (!admin) {
            return res.render('auth/pageNotFound', { msg: 'Error: No admin found. Create an admin first' })
        }
        await Coordinator.create({
            fullName: fullName,
            email: email,
            phone: phone,
            password: password,
            status: status,
            createdBy: admin._id,
        });
        return res.redirect('/admin/viewcoordinators');
    } catch (e) {
        console.log(e)
        return res.render('auth/pageNotFound', { msg: 'Error: Coordinator not added' })
    }
};

//      RENDER VIEW ALL COORDINATORS PAGE
exports.viewCoordinator = async (req, res) => {
    try {
        const coordinators = await Coordinator.find();
        return res.render('admin/viewCoordinators', { coordinators, activePage: 'coordinators' });
    } catch (err) {
        console.log(err);
        return res.render('auth/pageNotFound', { msg: 'Error loading coordinators list' })
    }
};

//      RENDER VIEW COORDINATOR DETAILS
exports.viewCoordinatorDetails = async (req, res) => {
    try {
        const id = req.params.id;

        const coord = await Coordinator // Fixed typo: 'coordinator' -> 'Coordinator'
            .findById(id)
            .populate({
                path: 'assignedStudents',
                match: { status: 'student' },
                select: 'fullName email standard',
            })
            .lean();

        if (!coord) {
            return res.render('auth/pageNotFound', { msg: 'Coordinator not found' });
        }

        return res.render('admin/viewCoordinatorDetails', {
            coordinator: coord,
            activePage: 'coordinators',
        });
    } catch (err) {
        console.log(err);
        return res.render('auth/pageNotFound', { msg: 'Error loading coordinator details' });
    }
};

//      DELETING COORDINATOR
exports.deleteCoordinator = async (req, res) => {
    try {
        const id = req.params.id;
        await Coordinator.findByIdAndDelete(id);
        return res.redirect('/admin/viewcoordinators');
    } catch (err) {
        console.log(err);
        return res.render('auth/pageNotFound', { msg: 'Error deleting coordinator' });
    }
};

//      RENDER EDIT COORDINATOR PAGE
exports.editCoordinatorPage = async (req, res) => {
    try {
        const id = req.params.id;
        const coord = await Coordinator.findById(id);
        if (!coord) {
            return res.render('auth/pageNotFound', { msg: 'Coordinator not found' });
        }
        return res.render('admin/editCoordinator', { coord, activePage: 'coordinators' });
    } catch (err) {
        console.log(err);
        return res.render('auth/pageNotFound', { msg: 'Error loading edit coordinator page' });
    }
};

//      UPDATING COORDINATOR DETAILS
exports.updateCoordinator = async (req, res) => {
    try {
        const id = req.params.id;
        await Coordinator.findByIdAndUpdate(id, req.body);
        return res.redirect('/admin/viewcoordinators');
    } catch (err) {
        console.log(err);
        return res.render('auth/pageNotFound', { msg: 'Error updating coordinator' });
    }
};

//      RENDER ADD TEACHER PAGE
exports.addTeacher = (req, res) => {
    return res.render('admin/addTeachers', { activePage: 'teachers' });
};

//      CREATING NEW TEACHER
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
            return res.render('auth/pageNotFound', { msg: 'Required fields missing for creating teacher' });
        }

        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher) {
            return res.render('auth/pageNotFound', { msg: 'Teacher with this email already exists' });
        }

        let profilePic = {};

        if (req.files && req.files.profilePic) {
            profilePic = await fileUploadToCloudinary(req.files.profilePic);
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
        return res.redirect('/admin/viewteachers');
    } catch (error) {
        console.error('Create Teacher Error:', error);
        return res.render('auth/pageNotFound', { msg: 'Server Error: Unable to create teacher' });
    }
};

//      RENDER VIEW ALL TEACHERS
exports.getTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find().sort({ createdAt: -1 });

        for (let teacher of teachers) {
            const sessions = await Session.find({
                teacher: teacher._id,
                status: 'APPROVED',
            }).select('durationInHours');

            teacher.totalHours = sessions.reduce((sum, s) => sum + s.durationInHours, 0);
        }

        return res.render('admin/viewTeachers', {
            teachers,
            activePage: 'teachers',
        });
    } catch (error) {
        console.error('Get Teachers Error:', error);
        return res.render('auth/pageNotFound', { msg: 'Server Error: Unable to load teachers list' });
    }
};

//      RENDER TEACHER PROFILE
exports.viewTeacherProfile = async (req, res) => {
    try {
        const teacherId = req.params.id;

        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.render('auth/pageNotFound', { msg: 'Teacher not found' });
        }

        const sessions = await Session.find({
            teacher: teacherId,
            status: 'APPROVED',
        }).select('durationInHours');

        const totalHours = sessions.reduce((sum, s) => sum + s.durationInHours, 0);

        return res.render('admin/teacherProfile', {
            teacher,
            totalHours,
            activePage: 'teachers',
        });
    } catch (error) {
        console.error(error);
        return res.render('auth/pageNotFound', { msg: 'Server Error: Unable to view teacher profile' });
    }
};

//      RENDER EDIT TEACHER PAGE
exports.getEditTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
            return res.render('auth/pageNotFound', { msg: 'Teacher not found for editing' });
        }
        return res.render('admin/editTeacher', {
            teacher,
            activePage: 'teachers',
        });
    } catch (error) {
        console.error('Get Edit Teacher Error:', error);
        return res.render('auth/pageNotFound', { msg: 'Server Error: Unable to load edit teacher page' });
    }
};

//      UPDATING TEACHER DETAILS
exports.updateTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.render('auth/pageNotFound', { msg: 'Teacher not found for update' });
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
            teacher.profilePic = await fileUploadToCloudinary(req.files.profilePic);
        }
        await teacher.save();
        return res.redirect('/admin/viewteachers');
    } catch (error) {
        console.error('Update Teacher Error:', error);
        return res.render('auth/pageNotFound', { msg: 'Server Error: Unable to update teacher' });
    }
};

//      DELETING TEACHER
exports.deleteTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
            return res.render('auth/pageNotFound', { msg: 'Teacher not found for deletion' });
        }
        if (teacher.profilePic?.public_id) {
            await cloudinary.uploader.destroy(teacher.profilePic.public_id);
        }
        await teacher.deleteOne();
        return res.redirect('/admin/viewteachers');
    } catch (error) {
        console.error('Delete Teacher Error:', error);
        return res.render('auth/pageNotFound', { msg: 'Server Error: Unable to delete teacher' });
    }
};

//      CHANGE COORDINATOR PASSWORD
exports.changeCoordinatorPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        if (!password || password.length < 8) {
            return res.redirect('/admin/viewcoordinators');
        }

        const Coordinator = await Coordinator.findById(id).select('+password');

        if (!Coordinator) {
            return res.redirect('/admin/viewcoordinators');
        }

        Coordinator.password = password;
        await Coordinator.save();
        console.log('coordinator password changed');

        return res.redirect('/admin/viewcoordinators');
    } catch (error) {
        console.error('Change password error:', error);
        return res.redirect('/admin/viewcoordinators');
    }
};

//      CHANGE TEACHER PASSWORD
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

        return res.redirect('/admin/viewteachers');
    } catch (error) {
        console.error('Teacher password change error:', error);
        return res.redirect('/admin/viewteachers');
    }
};

//      VIEW STUDENT SESSION HISTORY
exports.studentSessionHistory = async (req, res) => {
    try {
        const studentId = req.params.id;
        const studentName = await Student.findById(req.params.id).select('fullName');

        const studentSessions = await Session.find({
            student: studentId,
            status: 'APPROVED',
        })
            .populate('teacher', 'fullName')
            .sort({ createdAt: -1 });

        return res.render('admin/viewstudenthistory', {
            ssHistory: studentSessions,
            studentName,
            activePage: 'student',
        });
    } catch (error) {
        console.error('Error fetching session history:', error);
        return res.redirect(`/admin/viewstudentdetails/${req.params.id}`);
    }
};

// ================= PACKAGE =================

 //Add Package Page
exports.addPackage = async (req, res) => {
	const student = await Student.findById(req.params.studentId);

	res.render('admin/addpackage', {
		student,
		activePage: 'package'
	});
};
exports.postAddPackage = async (req, res) => {
	try {
		const { hours, amount, description, startDate, endDate, paymentDate } = req.body;

		await Student.findByIdAndUpdate(
			req.params.studentId,
			{   
                $inc:{
					remainingHours: Number(hours) 
				},
				$set: {
					package: {
						hours,
						amount,
						description,
						startDate,
						endDate,
						paymentDate
					}
				}
			},
			{
				new: true,
				runValidators: false 
			}
		);
		res.redirect(`/admin/viewstudentdetails/${req.params.studentId}`);

	} catch (error) {
		console.error(error);
		res.status(500).send('Error adding package');
	}
};


//      VIEW TEACHER SESSION HISTORY
exports.teacherSessionHistory = async (req, res) => {
    try {
        const teacherId = req.params.id;
        const teacherName = await Teacher.findById(req.params.id).select('fullName');
        const teacherSessions = await Session.find({
            teacher: teacherId,
            status: 'APPROVED',
        })
            .populate('student', 'fullName') // _id is included by default
            .sort({ createdAt: -1 });

        return res.render('admin/viewteacherhistory', {
            tsHistory: teacherSessions,
            teacherName,
            activePage: 'teacher',
        });
    } catch (error) {
        console.error('Error fetching session history:', error);
        return res.redirect(`/admin/viewteacherdetails/${req.params.id}`);
    }
};

//      RENDER ASSIGN TEACHER TO STUDENT PAGE
exports.getUpdateTeacher = async (req, res) => {
    try {
        const coord = await Admin.findById(req.user.id);
        const teachers = await Teacher.find();
        const { assignedTeachers } = await Student.findOne({ _id: req.params.studentId })
            .select('assignedTeachers')
            .populate('assignedTeachers');

        return res.render('admin/updateTeacher', {
            activePage: 'update-teacher',
            username: coord.fullName,
            t: teachers,
            assignedTeachers,
            studentId: req.params.studentId,
        });
    } catch (e) {
        console.log('error while rendering update teacher', e);
        return res.redirect(`/admin/dashboard`);
    }
};

//      ASSIGN A TEACHER TO STUDENT
exports.addUpdateTeacher = async (req, res) => {
    try {
        await Student.findByIdAndUpdate(req.params.studentId, {
            $addToSet: { assignedTeachers: req.params.teacherId },
        });

        return res.redirect(`/admin/update-teacher/${req.params.studentId}`);
    } catch (e) {
        console.log('error while assigning teacher', e);
        return res.redirect(`/admin/dashboard`);
    }
};

//      REMOVE ASSIGNED TEACHER FROM STUDENT
exports.removeUpdateTeacher = async (req, res) => {
    try {
        await Student.findByIdAndUpdate(req.params.studentId, {
            $pull: { assignedTeachers: req.params.teacherId },
        });

        return res.redirect(`/admin/update-teacher/${req.params.studentId}`);
    } catch (e) {
        console.log('error while removing assigned teacher', e);
        return res.redirect(`/admin/dashboard`);
    }
};


/* VIEW FINANCE */
exports.viewFinance = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });

    res.render("admin/viewFinance", {
      activePage: "finance",
      transactions
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading finance data");
  }
};

/* ADD FINANCE PAGE */
exports.addFinance = (req, res) => {
  res.render("admin/addFinance", { activePage: "finance" });
};

/* SAVE FINANCE */
exports.postAddFinance = async (req, res) => {
  try {
    const { transactionId, type, amount, description } = req.body;

    await Transaction.create({
      id: transactionId,
      transactionType: type.toUpperCase(), // CREDIT / DEBIT
      amount,
      description
    });

    res.redirect("/admin/finance");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error saving transaction");
  }
};

exports.viewFinanceDetails = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).send("Transaction not found");
    }

    res.render("admin/viewFinanceDetails", {
      activePage: "finance",
      transaction
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading transaction details");
  }
};



exports.viewSalary = async (req, res) => {
    const teacherId = req.params.id;
    const teacher = await Teacher.findById(teacherId);

    return res.render('admin/viewSalary', { activePage: 'teachers', teacher })
}

exports.addSalary = async (req, res) => {
    const teacherId = req.params.id;
    const teachers = await Teacher.findById(teacherId);

    return res.render('admin/addSalary', { activePage: 'teachers', teachers })
}

// ==========================================
//        INVOICE CONTROLLERS
// ==========================================

//      RENDER INVOICE PAGE
exports.getInvoicePage = async(req,res) => {
    try{
        return res.render('admin/addinvoice',{activePage:'invoice'})
    }catch(e){
        console.log(e)
        return res.send(e)
    }
}
// Example Controller Logic
exports.addInvoice = async (req, res) => {
  try {
    const { id, studentId, amount, date, paid, description, items } = req.body;

    // 'items' might come in as an array or object depending on parser.
    // Ensure it is an array for the schema
    const itemArray = Array.isArray(items) ? items : Object.values(items);

    const newInvoice = new Invoice({
      id,
      studentId,
      amount, // Calculated by JS, verified here
      item: itemArray, // Maps to your schema structure
      description,
      date,
      paid
    });

    await newInvoice.save();
    return res.render('admin/viewinvoice',{newInvoice,activePage:'invoice'});
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating invoice");
  }
};



exports.downloadInvoicePDF = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const invoice = await Invoice.findOne({ id: invoiceId });

    if (!invoice) {
      return res.status(404).send("Invoice not found");
    }

    // --- 1. IMAGE CONVERSION FUNCTION (With Debugging) ---
    const imageToBase64 = (filename) => {
        try {
            // "process.cwd()" gets the root folder of your project
            // We assume your images are in: YourProject/public/image/filename
            const filePath = path.join(process.cwd(), 'static', 'image', filename);
            
            // DEBUG: Print the path to your console so you can check if it is right
            console.log("Looking for image at:", filePath); 

            if (!fs.existsSync(filePath)) {
                console.error("File does not exist at path:", filePath);
                return null;
            }

            const bitmap = fs.readFileSync(filePath);
            // Check extension to set correct mimetype (png or webp)
            const ext = path.extname(filePath).substring(1); 
            return `data:image/${ext};base64,${bitmap.toString('base64')}`;
        } catch (err) {
            console.error("Error converting image:", err);
            return null;
        }
    };

    // --- 2. GET IMAGES ---
    // Pass only the filename, not the full '/image/...' path
    const logoBase64 = imageToBase64('logo.png'); 
    const paidBase64 = imageToBase64('paid.webp');

    // --- 3. RENDER EJS ---
    const templatePath = path.join(__dirname, '../views/admin/viewinvoice.ejs');
    
    const html = await ejs.renderFile(templatePath, { 
        newInvoice: invoice,
        logoSrc: logoBase64, 
        paidSrc: paidBase64   
    });

    // --- 4. PUPPETEER ---
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox'] 
    });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('print');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px' }
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoiceId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);

  } catch (err) {
    console.error("PDF Generation Error:", err);
    res.status(500).send("Error generating PDF");
  }
};