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

exports.viewPayment=(req,res)=>{
    return res.render('parent/viewPayment')
}