require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const connectCloudinary=require('./config/cloudinary')
const fileUpload = require('express-fileupload')

const app = express();
const connectdb = require('./config/db');

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload({useTempFiles: true,tempFileDir: '/tmp/'}))

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  next()
})

const auth = require('./routes/authRoutes');
app.use('/', auth);

const adminRoutes = require('./routes/adminRoutes')
app.use('/admin', adminRoutes)

const coordinator = require('./routes/coordinatorRoutes')
app.use('/coordinator', coordinator)

const port = process.env.PORT || 5000;
app.listen(port, async () => {
    await connectdb();
    console.log(` App started on port ${port}`);
});
