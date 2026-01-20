const Student = require('../models/Student');
const Report = require('../models/Report')
exports.parentDashboard = async (req, res) => {
    try {

        return res.render('parent/dashboard', {
            activePage: 'parent',
        });
    } catch (err) {
        console.error(err);
        return res.render('auth/pageNotFound', { msg: 'Error: Unable to load teacher dashboard' });
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
      scores: JSON.stringify(scores)
    });

  } catch (error) {
    console.error(error);
    return res.render('auth/pageNotFound', {
      msg: 'Error loading report page'
    });
  }
};