const Student = require('../models/Student');
const report = require('../models/Report')
const Session = require('../models/Session');



exports.parentDashboard = async (req, res) => {
  try {
    const student = await Student.findOne().sort({ createdAt: -1 });

    res.render('parent/dashboard', {
      activePage: 'parent',
      student
    });
  } catch (err) {
    console.error(err);
    res.render('auth/pageNotFound', {
      msg: 'Unable to load parent dashboard'
    });
  }
};


exports.viewPayment = async (req, res) => {
  try {
    // Fetch any one student (latest for example)
    const student = await Student.findOne().sort({ createdAt: -1 });

    return res.render('parent/viewPayment', {
      student
    });
  } catch (err) {
    console.error(err);
    return res.render('auth/pageNotFound', {
      msg: 'Unable to load payment details'
    });
  }
};
exports.viewReport = (req, res) => {
  try {
    res.render('parent/viewReport');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading report page');
  }
};

exports.viewClassHistory = async (req, res) => {
  try {
    // Fetch latest student (or you can fetch specific student via req.user if auth is implemented)
    const student = await Student.findOne().sort({ createdAt: -1 });

    if (!student) {
      return res.render('auth/pageNotFound', { msg: 'Student not found' });
    }

    // Fetch all sessions for this student and populate teacher info
    const sessions = await Session.find({ student: student._id })
      .populate('teacher', 'fullName email')
      .sort({ date: -1 });

    res.render('parent/classHistory', {
      student,
      sessions
    });
  } catch (err) {
    console.error(err);
    res.render('auth/pageNotFound', { msg: 'Unable to load class history' });
  }
};
