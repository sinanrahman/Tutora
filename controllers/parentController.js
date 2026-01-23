const Student = require('../models/Student');
const Report = require('../models/Report');
const Session = require('../models/Session');
const Invoice = require('../models/Invoice');
const fs = require('fs');
const path = require('path'); // ✅ REQUIRED
const ejs = require('ejs');
const puppeteer = require('puppeteer');

exports.parentDashboard = async (req, res) => {
	try {
		const student = await Student.findById(req.user.id).populate('coordinator', 'fullName');

		const currentYear = new Date().getFullYear();

		const latestReport = await Report.findOne({
			student: student._id,
			year: currentYear,
		})
			.sort({ createdAt: -1 })
			.lean();

		let avgPerformance = 0;

		const reports = await Report.find({
			student: student._id,
			year: currentYear,
			type: 'monthly',
		}).select('score');

		if (reports.length > 0) {
			const totalScore = reports.reduce((sum, r) => sum + r.score, 0);
			avgPerformance = Math.round(totalScore / reports.length);
		}

// 🔹 Calculate hours left till package expiry
let hoursLeft = 0;

if (student?.package?.endDate) {
  const now = new Date();
  const endDate = new Date(student.package.endDate);

  const diffMs = endDate - now;
  hoursLeft = diffMs > 0
    ? Math.ceil(diffMs / (1000 * 60 * 60))
    : 0;
}

		res.render('parent/dashboard', {
			activePage: 'dashboard',
			student,
			latestReport,
			avgPerformance,
			currentYear,
			hoursLeft
		});
	} catch (err) {
		console.error(err);
		res.render('auth/pageNotFound', {
			msg: 'Unable to load parent dashboard',
		});
	}
};

exports.viewPayment = async (req, res) => {
	try {
		const student = await Student.findById(req.user.id);
		if (!student) {
			return res.render('auth/pageNotFound', { msg: 'Student not found' });
		}
		const invoices = await Invoice.find({ studentId: student.studentId }).sort({ date: -1 });

		return res.render('parent/viewPayment', {
			student,
			invoices,
			activePage: 'payments',
		});
	} catch (err) {
		console.error(err);
		return res.render('auth/pageNotFound', { msg: 'Unable to load payment details' });
	}
};

exports.viewInvoice = async (req, res) => {
	try {
		const invoiceId = req.params.id;
		const invoice = await Invoice.findOne({ id: invoiceId });

		if (!invoice) {
			return res.render('auth/pageNotFound', { msg: 'Invoice not found' });
		}
		const student = await Student.findById(req.user.id);
		if (!student || invoice.studentId !== student.studentId) {
			return res.status(403).send('Access Denied');
		}
		return res.render('parent/viewInvoicee', { newInvoice: invoice, activePage: 'payments' });
	} catch (err) {
		console.error(err);
		return res.render('auth/pageNotFound', { msg: 'Unable to load invoice' });
	}
};

exports.viewStudentInvoicePDF = async (req, res) => {
	try {
		const invoiceId = req.params.id;
		const invoice = await Invoice.findOne({ id: invoiceId });
		if (!invoice) return res.render('auth/pageNotFound', { msg: 'Invoice not found' });

		const student = await Student.findById(req.user.id);
		if (!student || invoice.studentId !== student.studentId) {
			return res.status(403).send('Access Denied');
		}

		return res.render('parent/viewInvoicee', {
			newInvoice: invoice,
			activePage: 'payments',
		});
	} catch (err) {
		console.error(err);
		return res.render('auth/pageNotFound', { msg: 'Unable to load invoice' });
	}
};

exports.downloadParentInvoicePDF = async (req, res) => {
	try {
		const invoiceId = req.params.id;

		const invoice = await Invoice.findOne({ id: invoiceId });
		if (!invoice) {
			return res.status(404).send('Invoice not found');
		}

		const student = await Student.findById(req.user.id);
		if (!student || invoice.studentId !== student.studentId) {
			return res.status(403).send('Access Denied');
		}

		const imageToBase64 = (filename) => {
			try {
				const filePath = path.join(process.cwd(), 'static', 'image', filename);

				if (!fs.existsSync(filePath)) {
					console.error('File does not exist:', filePath);
					return null;
				}

				const bitmap = fs.readFileSync(filePath);
				const ext = path.extname(filePath).substring(1);
				return `data:image/${ext};base64,${bitmap.toString('base64')}`;
			} catch (err) {
				console.error('Image conversion error:', err);
				return null;
			}
		};

		const logoBase64 = imageToBase64('logo.png');
		const paidBase64 = imageToBase64('paid.webp');

		const templatePath = path.join(__dirname, '../views/parent/viewInvoicee.ejs');

		const html = await ejs.renderFile(templatePath, {
			newInvoice: invoice,
			logoSrc: logoBase64,
			paidSrc: paidBase64,
		});

		const browser = await puppeteer.launch({
			headless: 'new',
			args: ['--no-sandbox'],
		});

		const page = await browser.newPage();
		await page.setContent(html, { waitUntil: 'networkidle0' });
		await page.emulateMediaType('print');

		const pdfBuffer = await page.pdf({
			format: 'A4',
			printBackground: true,
			margin: { top: '20px', bottom: '20px' },
		});

		await browser.close();

		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoiceId}.pdf"`);
		res.send(pdfBuffer);
	} catch (err) {
		console.error('PDF Generation Error:', err);
		res.status(500).send('Error generating PDF');
	}
};

exports.viewReportGraph = async (req, res) => {
  try {
    const user = req.user || {};
    let students = [];

    if (user.email) {
      const parentEmail = String(user.email).trim();
      students = await Student.find({ parentEmail }).lean();

      if (!students.length) {
        students = await Student.find({
          parentEmail: { $regex: `^${parentEmail}$`, $options: 'i' },
        }).lean();
      }
    }

    if (!students.length && user.role === 'PARENT' && (user.id || user._id)) {
      const uid = user.id || user._id;
      const studentDoc = await Student.findById(uid).lean();
      if (studentDoc) students = [studentDoc];
    }

    if (!students.length && req.query?.studentId) {
      const studentDoc = await Student.findById(req.query.studentId).lean();
      if (studentDoc) students = [studentDoc];
    }

    if (!students.length) {
      req.flash?.('error', 'No students found.');
      return res.redirect('/parent/dashboard');
    }

    const student = students[0];

    const reportsRaw = await Report.find({ student: student._id })
      .sort({ year: 1, month: 1, week: 1 })
      .lean();

    const reports = reportsRaw.map(r => ({
      _id: r._id,
      score: r.score,
      remarks: r.remarks,
      week: r.week,
      month: r.month,
      year: r.year,
      type: r.type,
      viewDate: r.viewDate,
    }));

    return res.render('parent/viewReport', {
      student,
      reports,
      activePage: 'reports',
    });
  } catch (err) {
    console.error(err);
    req.flash?.('error', 'Error loading report');
    res.redirect('/parent/dashboard');
  }
};


exports.remark = async (req, res) => {
  try {
    const user = req.user || {};
    let students = [];

    if (user.email) {
      const parentEmail = String(user.email).trim();
      students = await Student.find({ parentEmail }).lean();
    }

    if (!students.length && req.query?.studentId) {
      const studentDoc = await Student.findById(req.query.studentId).lean();
      if (studentDoc) students = [studentDoc];
    }

    if (!students.length) {
      req.flash?.('error', 'No students found.');
      return res.redirect('/parent/dashboard');
    }

    const student = students[0];

    // ✅ CORRECT SORTING
    const reportsRaw = await Report.find({ student: student._id })
      .sort({ createdAt: -1 }) // 🔥 newest added first
      .lean();

    const reports = reportsRaw.map(r => ({
      score: r.score,
      remarks: r.remarks,
      week: r.week,
      month: r.month,
      year: r.year,
      type: r.type,
      viewDate: r.viewDate,
      createdAt: r.createdAt,
    }));

    return res.render('parent/remark', {
      student,
      reports,
      activePage: 'reports',
    });
  } catch (err) {
    console.error(err);
    res.redirect('/parent/dashboard');
  }
};






exports.viewClassHistory = async (req, res) => {
	try {
		const student = await Student.findById(req.user.id);

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
			activePage: 'sessions',
		});
	} catch (err) {
		console.error(err);
		res.render('auth/pageNotFound', { msg: 'Unable to load class history' });
	}
};
