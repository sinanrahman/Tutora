module.exports = {
	ADMIN: [
		{ key: 'dashboard', label: 'Dashboard', url: '/admin/dashboard' },
		{ key: 'students', label: 'Students', url: '/admin/viewstudents' },
		{ key: 'coordinators', label: 'Coordinators', url: '/admin/viewcoordinators' },
		{ key: 'teachers', label: 'Teachers', url: '/admin/viewteachers' },
		{ key: 'finance', label: 'Finance', url: '/admin/viewfinance' },
	],

	COORDINATOR: [
		{ key: 'dashboard', label: 'Dashboard', url: '/coordinator/dashboard' },
		{ key: 'session', label: 'Session Approval', url: '/coordinator/session-approval' },
	],

	TEACHER: [
		{ key: 'dashboard', label: 'Dashboard', url: '/teacher/dashboard' },
		{ key: 'sessions', label: 'Session List', url: '/teacher/sessions' },
	],
};
