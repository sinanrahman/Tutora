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




const port = process.env.PORT || 5000;
app.listen(port, async () => {
	await connectdb();
	console.log(` App started on port ${port}`);
});
