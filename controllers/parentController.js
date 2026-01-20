const report = require('../models/Report')

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


exports.viewReport = (req, res) => {
  try {
    res.render('parent/viewReport');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading report page');
  }
};



exports.viewPayment=(req,res)=>{
    return res.render('parent/viewPayment')
}
