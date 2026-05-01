const express = require("express");
const router = express.Router();

const {
  loginUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require("../controllers/authController.js");

router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
