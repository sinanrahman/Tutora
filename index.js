require('dotenv').config()
const express = require('express');
const app = express();
const connectdb=require('./config/db')
app.set('view engine','ejs')

app.use(express.urlencoded())
const port = process.env.PORT||5000;

app.get('/',((req,res)=>{
    return res.send('hello')
}))
app.listen(port, async () => {
    console.log(`App started on ${port}`);
    await connectdb()
});
