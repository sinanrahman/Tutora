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
