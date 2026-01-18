require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const connectdb = require('./config/db');

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('static'));

app.use(cookieParser());
app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: '/tmp/',
	})
);

app.use((req, res, next) => {
	res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
	next();
});

//		ALL LOGIN
const auth = require('./routes/authRoutes');
app.use('/', auth);

//		ADMIN
const adminRoutes = require('./routes/adminRoutes');
app.use('/admin', adminRoutes);

//		COORDINATOR
const coordinatorRoutes = require('./routes/coordinatorRoutes');
app.use('/coordinator', coordinatorRoutes);

//		TEACHER
const teacherRoutes = require('./routes/teacherRoutes');
app.use('/teacher', teacherRoutes);

//		SESSION
const sessionRoutes = require('./routes/sessionRoutes');
app.use('/sessions', sessionRoutes);

//		ERROR PAGE
app.use((req, res) => {
	res.status(404).render('auth/pageNotFound', { msg: ' ' });
});



// const mongoose = require('mongoose');
const Student = require('./models/Student'); // Update path to your model

const updateExistingStudents = async () => {
    try {
		console.log("started updating existing students")
        // 1. Fetch all students sorted by creation date (Oldest first)
        const students = await Student.find({}).sort({ createdAt: 1 });

        console.log(`Found ${students.length} students to update...`);

        let counter = 1;

        // 2. Loop through each student
        for (const student of students) {
            // Check if student already has an ID to avoid overwriting (optional)
            if (student.studentId) continue;

            // 3. Generate the ID
            // padStart(3, '0') ensures "1" becomes "001", but "1000" stays "1000"
            const idPart = counter.toString().padStart(3, '0'); 
            const newId = `S_${idPart}`;

            // 4. Update the document
            student.studentId = newId;
            await student.save();
            
            console.log(`Updated: ${student.fullName} -> ${newId}`);
            
            counter++;
        }

        console.log('All students updated successfully!');

    } catch (error) {
        console.error('Migration failed:', error);
    }
};

const Teacher = require('./models/Teacher'); // Update path

const updateExistingTeachers = async () => {
    try {
		console.log("started updating existing teachers")
        // 1. Fetch all teachers sorted by creation date
        const teachers = await Teacher.find({}).sort({ createdAt: 1 });

        console.log(`Found ${teachers.length} teachers to update...`);

        let counter = 1;

        // 2. Loop through each teacher
        for (const teacher of teachers) {
            // Check if teacher already has an ID
            if (teacher.teacherId) continue;

            // 3. Generate the ID (T_001 format)
            const idPart = counter.toString().padStart(3, '0'); 
            const newId = `T_${idPart}`;

            // 4. Update the document
            teacher.teacherId = newId;
            await teacher.save();
            
            console.log(`Updated: ${teacher.fullName} -> ${newId}`);
            
            counter++;
        }

        console.log('All teachers updated successfully!');

    } catch (error) {
        console.error('Teacher Migration failed:', error);
    }
};

const Coordinator = require('./models/Coordinator'); // Update path

const updateExistingCoordinators = async () => {
    try {
		console.log("started updating existing Coordinator")
        // 1. Fetch all coordinators sorted by creation date
        const coordinators = await Coordinator.find({}).sort({ createdAt: 1 });

        console.log(`Found ${coordinators.length} coordinators to update...`);

        let counter = 1;

        // 2. Loop through each coordinator
        for (const coordinator of coordinators) {
            // Check if coordinator already has an ID
            if (coordinator.coordinatorId) continue;

            // 3. Generate the ID (C_001 format)
            const idPart = counter.toString().padStart(3, '0'); 
            const newId = `C_${idPart}`;

            // 4. Update the document
            coordinator.coordinatorId = newId;
            await coordinator.save();
            
            console.log(`Updated: ${coordinator.fullName} -> ${newId}`);
            
            counter++;
        }

        console.log('All coordinators updated successfully!');

    } catch (error) {
        console.error('Coordinator Migration failed:', error);
    }
};

const port = process.env.PORT || 5000;
app.listen(port, async () => {
	await connectdb();
	await updateExistingStudents()
	await updateExistingTeachers()
	await updateExistingCoordinators()
	console.log(` App started on port ${port}`);
});
