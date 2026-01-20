const Student = require('../models/Student');

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
