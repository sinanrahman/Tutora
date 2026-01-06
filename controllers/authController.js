exports.loginPage = (req,res)=>{
    return res.render('auth/login')
}

exports.adminLoginPage = (req,res)=>{
    return res.render('auth/adminLogin')
}

exports.teacherLoginPage = (req,res)=>{
    return res.render('auth/teacherLogin')
}

exports.coordinatorLoginPage = (req,res)=>{
    return res.render('auth/coordinatorLogin')
}