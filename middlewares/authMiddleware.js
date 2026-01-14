const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

exports.protect = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.redirect('/');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    // If admin → fetch admin data
    if (decoded.role === 'ADMIN') {
      const admin = await Admin.findById(decoded.id);
      if (!admin) return res.redirect('/');

      // Make available to all EJS files
       return res.locals.admin = admin;
    }

    next();
  } catch (err) {
    return res.redirect('/');
  }
};
