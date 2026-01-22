const Student = require('../models/Student');
const Report = require('../models/Report')
const Session = require('../models/Session');
const Invoice = require('../models/Invoice');
const fs = require('fs');
const path = require('path');           // ✅ REQUIRED
const ejs = require('ejs');
const puppeteer = require('puppeteer');

exports.parentDashboard = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id)
      .populate('coordinator', 'fullName');

    const currentYear = new Date().getFullYear();

    const latestReport = await Report.findOne({
      student: student._id,
      year: currentYear
    })
      .sort({ createdAt: -1 })
      .lean();

    const reports = await Report.find({
      student: student._id,
      year: currentYear
    }).select('score');

    let avgPerformance = 0;

    if (reports.length > 0) {
      const totalScore = reports.reduce((sum, r) => sum + r.score, 0);
      avgPerformance = Math.round(totalScore / reports.length);
    }

    res.render('parent/dashboard', {
      activePage: 'dashboard',
      student,
      latestReport,
      avgPerformance,
      currentYear
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
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.render('auth/pageNotFound', { msg: 'Student not found' });
    }
    const invoices = await Invoice.find({ studentId: student.studentId }).sort({ date: -1 });

    return res.render('parent/viewPayment', {
      student,
      invoices, 
      activePage: 'payments'
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
      activePage: 'payments'
    });

  } catch (err) {
    console.error(err);
    return res.render('auth/pageNotFound', { msg: 'Unable to load invoice' });
  }
};



exports.downloadParentInvoicePDF = async (req, res) => {
  try {
    const invoiceId = req.params.id;

    // 1️⃣ Find invoice
    const invoice = await Invoice.findOne({ id: invoiceId });
    if (!invoice) {
      return res.status(404).send("Invoice not found");
    }

    // 2️⃣ Verify logged-in parent owns this invoice
    const student = await Student.findById(req.user.id);
    if (!student || invoice.studentId !== student.studentId) {
      return res.status(403).send("Access Denied");
    }

    // 3️⃣ IMAGE CONVERSION FUNCTION
    const imageToBase64 = (filename) => {
      try {
        const filePath = path.join(process.cwd(), 'static', 'image', filename);

        if (!fs.existsSync(filePath)) {
          console.error("File does not exist:", filePath);
          return null;
        }

        const bitmap = fs.readFileSync(filePath);
        const ext = path.extname(filePath).substring(1);
        return `data:image/${ext};base64,${bitmap.toString('base64')}`;
      } catch (err) {
        console.error("Image conversion error:", err);
        return null;
      }
    };

    // 4️⃣ Get images
    const logoBase64 = imageToBase64('logo.png');
    const paidBase64 = imageToBase64('paid.webp');

    // 5️⃣ Render PARENT invoice template
    const templatePath = path.join(
      __dirname,
      '../views/parent/viewInvoicee.ejs'
    );

    const html = await ejs.renderFile(templatePath, {
      newInvoice: invoice,
      logoSrc: logoBase64,
      paidSrc: paidBase64
    });

    // 6️⃣ Puppeteer PDF generation
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('print');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px' }
    });

    await browser.close();

    // 7️⃣ Send PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="invoice-${invoiceId}.pdf"`
    );
    res.send(pdfBuffer);

  } catch (err) {
    console.error("PDF Generation Error:", err);
    res.status(500).send("Error generating PDF");
  }
};

// Replace only the exports.viewReport function in your parent controller file with this.

exports.viewReport = async (req, res) => {
  try {
    const user = req.user || {};
    console.log('viewReport: req.user =', user);

    let students = [];

    // 1️⃣ Parent email based lookup
    if (user.email) {
      const parentEmail = String(user.email).trim();
      students = await Student.find({ parentEmail }).lean();

      if (!students.length) {
        students = await Student.find({
          parentEmail: { $regex: `^${parentEmail}$`, $options: 'i' }
        }).lean();
      }
    }

    // 2️⃣ Token-based fallback
    if (!students.length && user.role === 'PARENT' && (user.id || user._id)) {
      const uid = user.id || user._id;
      const studentDoc = await Student.findById(uid).lean();
      if (studentDoc) students = [studentDoc];
    }

    // 3️⃣ Query param fallback
    if (!students.length && req.query?.studentId) {
      const studentDoc = await Student.findById(req.query.studentId).lean();
      if (studentDoc) students = [studentDoc];
    }

    // ❌ No student → redirect (original behavior)
    if (!students.length) {
      if (req.flash) {
        req.flash('error', 'No students found for your account.');
      }
      return res.redirect('/parent/dashboard');
    }

    const student = students[0];
    console.log('Selected student:', student._id);

    // 📊 Fetch reports (same logic as before)
    let reportsRaw = await Report.find({ student: student._id })
      .sort({ year: 1, month: 1, week: 1 })
      .lean();

    // 🔁 Multi-student fallback (unchanged)
    if (!reportsRaw.length && students.length > 1) {
      reportsRaw = await Report.find({
        student: { $in: students.map(s => s._id) }
      })
        .sort({ year: 1, month: 1, week: 1 })
        .lean();
    }

    // ✅ IMPORTANT FIX:
    // Do NOT redirect if reports are empty
    if (!reportsRaw) {
      reportsRaw = [];
    }

    // 🧱 Prepare data for EJS
    const reports = reportsRaw.map(r => ({
      _id: r._id,
      score: r.score,
      remarks: r.remarks,
      week: r.week,
      month: r.month,
      year: r.year,
      type: r.type,
      viewDate: r.viewDate
    }));

    console.log('Final report count:', reports.length);

    // ✅ Always render page once student exists
    return res.render('parent/viewReport', {
      student,
      reports,
      activePage: 'reports'
    });

  } catch (err) {
    console.error('Error in viewReport:', err);
    if (req.flash) {
      req.flash('error', 'Something went wrong while fetching reports.');
    }
    return res.redirect('/parent/dashboard');
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
      activePage:'sessions'
    });
  } catch (err) {
    console.error(err);
    res.render('auth/pageNotFound', { msg: 'Unable to load class history' });
  }
};
