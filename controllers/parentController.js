const Student = require('../models/Student');
const Report = require('../models/Report')
const Session = require('../models/Session');



exports.parentDashboard = async (req, res) => {
  try {
   const student = await Student.findById(req.user.id)
    .populate('coordinator', 'fullName');
     const latestReport = await Report.findOne({ student: student._id })
      .sort({ createdAt: -1 })
      .lean();

      const reports = await Report.find({ student: student._id }).select('score');

    let avgPerformance = 0;

    if (reports.length > 0) {
      const totalScore = reports.reduce((sum, r) => sum + r.score, 0);
      avgPerformance = Math.round(totalScore / reports.length);
    }

    res.render('parent/dashboard', {
      activePage: 'dashboard',
      student,
      latestReport,
      avgPerformance
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
const student = await Student.findById(req.user.id)
    return res.render('parent/viewPayment', {
      student,
      activePage:'payments'
    });
  } catch (err) {
    console.error(err);
    return res.render('auth/pageNotFound', {
      msg: 'Unable to load payment details'
    });
  }
};




exports.viewReport = async (req, res) => {
  try {
    // get logged-in parent's student
    const student = await Student.findById(req.user.id)
      .populate('coordinator');

    if (!student) {
      return res.render('auth/pageNotFound', { msg: 'Student not found' });
    }

    const reports = await Report.find({ student: student._id })
      .sort({ year: 1, month: 1, week: 1 });

    const labels = reports.map(r => `Week ${r.week}`);
    const scores = reports.map(r => r.score);

    return res.render('parent/viewReport', {
      student,
      reports,
      labels: JSON.stringify(labels),
      scores: JSON.stringify(scores),
      activePage:'reports'
    });

  } catch (error) {
    console.error(error);
    return res.render('auth/pageNotFound', {
      msg: 'Error loading report page'
    });
  }
};

exports.viewClassHistory = async (req, res) => {
  try {
    // Fetch latest student (or you can fetch specific student via req.user if auth is implemented)
    const student = await Student.findOne({ parentEmail: req.user.email });


    if (!student) {
      return res.render('auth/pageNotFound', { msg: 'Student not found' });
    }

    // Fetch all sessions for this student and populate teacher info
    const sessions = await Session.find({ student: student._id })
      .populate('teacher', 'fullName email')
      .sort({ date: -1 });

    res.render('parent/classHistory', {
      student,
      sessions,
      activePage:'sessions'
    });
  } catch (err) {
    console.error(err);
    res.render('auth/pageNotFound', { msg: 'Unable to load class history' });
  }
};
