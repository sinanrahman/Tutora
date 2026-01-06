const express = require("express");
const router = express.Router();
const { protect, isAdmin } = require("../middlewares/authMiddleware");

router.get("/dashboard", protect, isAdmin, (req, res) => {
  res.render("admin/dashboard", { user: req.user });
});

module.exports = router;
