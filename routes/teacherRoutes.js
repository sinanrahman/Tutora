const express = require("express");
const router = express.Router();
const { protect, isTeacher } = require("../middlewares/authMiddleware");

router.get("/dashboard", protect, isTeacher, (req, res) => {
  res.render("teacher/dashboard", { user: req.user });
});

module.exports = router;
