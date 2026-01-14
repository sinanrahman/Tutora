const sidebarMenu = require('../config/sidebarMenu');

exports.setSidebarMenu = (req, res, next) => {
	if (req.user?.role) {
		res.locals.role = req.user.role;
		res.locals.menu = sidebarMenu[req.user.role] || [];
	} else {
		res.locals.menu = [];
	}
	next();
};
