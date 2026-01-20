module.exports = {
	ADMIN: [
		{ key: 'dashboard', label: 'Dashboard', url: '/admin/dashboard' },
		{ key: 'students', label: 'Students', url: '/admin/viewstudents' },
		{ key: 'coordinators', label: 'Coordinators', url: '/admin/viewcoordinators' },
		{ key: 'teachers', label: 'Teachers', url: '/admin/viewteachers' },
		{ key: 'finance', label: 'Finance', url: '/admin/viewfinance' },
		{ key: 'invoice', label: 'Invoice', url: '/admin/addinvoice' },
	],

	COORDINATOR: [
		{ key: 'dashboard', label: 'Dashboard', url: '/coordinator/dashboard' },
		{ key: 'session', label: 'Session Approval', url: '/coordinator/session-approval' },
	],

	TEACHER: [
		{ key: 'dashboard', label: 'Dashboard', url: '/teacher/dashboard' },
		{ key: 'sessions', label: 'Session List', url: '/teacher/sessions' },
		{ key: 'teacherProfile', label: 'Teacher Profile', url: '/teacher/profile' },
	],

	PARENT: [
		{ key: 'dashboard', label: 'Dashboard', url: '/parent/dashboard' },
		{ key: 'payments', label: 'Payments', url: '/parent/viewpayments' },
		{ key: 'reports', label: 'Reports', url: '/parent/viewreport' },
		{ key: 'sessions', label: 'Class History', url: '/parent/sessions' },
	],
};
