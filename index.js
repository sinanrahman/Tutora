require('dotenv').config();
const express = require('express');
const app = express();
const connectdb = require('./config/db');
const cookieParser = require("cookie-parser");

app.set('view engine', 'ejs');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
const auth = require('./routes/authRoutes');
app.use('/', auth);


// Server
const port = process.env.PORT || 5000;
app.listen(port, async () => {
    console.log(`App started on ${port}`);
    await connectdb();
});
