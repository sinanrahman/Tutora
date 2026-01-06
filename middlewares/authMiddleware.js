const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

exports.protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.redirect("/");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.redirect("/");
    }

    req.user = user; // attach user to request
    next();
  } catch (error) {
    console.error(error);
    return res.redirect("/");
  }
};

// Role-based access
exports.isAdmin = (req, res, next) => {
  if (req.user.role === "admin") return next();
  return res.status(403).send("Access Denied");
};

exports.isTeacher = (req, res, next) => {
  if (req.user.role === "teacher") return next();
  return res.status(403).send("Access Denied");
};

exports.isCoordinator = (req, res, next) => {
  if (req.user.role === "coordinator") return next();
  return res.status(403).send("Access Denied");
};
