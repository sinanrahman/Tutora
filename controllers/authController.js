const User = require('../models/UserModel')

exports.loginPage = (req, res) => {
    return res.render('auth/login')
}

exports.adminLoginPage = (req, res) => {
    return res.render('auth/adminLogin')
}

exports.teacherLoginPage = (req, res) => {
    return res.render('auth/teacherLogin')
}

exports.coordinatorLoginPage = (req, res) => {
    return res.render('auth/coordinatorLogin')
}

exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.render("auth/login", { error: "Invalid credentials" });

        const isMatch = await User.validatePassword(password)
        if (!isMatch) return res.render("auth/login", { error: "Invalid credentials" });

        if (user.role !== role) {
            return res.render("auth/login", { error: "Unauthorized role" });
        }

        const token = User.getjwt()

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            maxAge: 24 * 60 * 60 * 1000
        });

        if (user.role === "admin") return res.redirect("/admin/dashboard");
        if (user.role === "teacher") return res.redirect("/teacher/dashboard");
        if (user.role === "coordinator") return res.redirect("/coordinator/dashboard");

    } catch (err) {
        console.error(err);
        res.send("Login error");
    }
};

