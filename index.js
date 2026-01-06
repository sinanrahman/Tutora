require('dotenv').config()
const express = require('express');
const app = express();
const connectdb=require('./config/db')
app.set('view engine','ejs')

app.use(express.urlencoded())
const port = process.env.PORT||5000;

const auth = require('./routes/authRoutes')

app.use('/',auth)

app.listen(port, async () => {
    console.log(`App started on ${port}`);
    await connectdb()
});
