const Coordinator = require('../models/Coordinator')
const Teacher = require('../models/Teacher')
const Student = require('../models/Student')

/**
 * Coordinator Dashboard
 */
exports.coordinatorDashboard = async (req, res) => {
    try {
        // 🔹 Step 1: Check if req.user exists
        if (!req.user || !req.user.id) {
            console.log("❌ req.user is missing or id is undefined:", req.user);
            return res.status(401).send("You must be logged in as a coordinator");
        }

        const coordinatorId = req.user.id;
        console.log("🔹 Logged in coordinator ID:", coordinatorId);

        // 🔹 Step 2: Find the coordinator in DB
        const coord = await Coordinator.findById(coordinatorId);
        console.log("🔹 Coordinator fetched from DB:", coord);

        if (!coord) {
            return res.status(404).send("Coordinator not found in database");
        }

        // 🔹 Step 3: Fetch students assigned to this coordinator
        const students = await Student.find({ coordinator: coordinatorId })
            .populate("assignedTeachers", "fullName");
        console.log(`🔹 ${students.length} students found for coordinator`);

        // 🔹 Step 4: Fetch all teachers
        const teachers = await Teacher.find().select("_id fullName subjects");
        console.log(`🔹 ${teachers.length} teachers found`);

        // 🔹 Step 5: Render dashboard
        res.render("coordinator/dashboard", {
            coord,
            students,
            teachers
        });

    } catch (err) {
        console.error("❌ Error loading coordinator dashboard:", err);
        res.status(500).send("Server error while loading dashboard");
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
            coordinator: coord._id
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
            coordinator: coord._id
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
        const { teachers } = req.body; // array of teacher IDs

        if (!teachers || teachers.length !== 4) {
            return res.status(400).send('Exactly 4 teachers required');
        }

        const student = await Student.findById(studentId);
        if (!student) return res.status(404).send('Student not found');

        student.assignedTeachers = [...new Set(teachers)];
        await student.save();

        res.redirect('/coordinator/assigned-students');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error assigning teachers');
    }
};
