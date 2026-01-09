const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
	const token = req.cookies.token;

	if (!token) return res.redirect('/');

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;
		next();
	} catch (err) {
		return res.redirect('/');
	}
};

exports.isTeacher = (req, res, next) => {
	if (req.user && req.user.role === 'TEACHER') {
		return next();
	}
	return res.status(403).render('auth/pageNotFound');
};
exports.isCoordinator = (req, res, next) => {
	if (req.user.role !== 'coordinator') {
		return res.redirect('/');
	}
	next();
};
