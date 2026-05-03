const express = require("express");
const router = express.Router();
const { loginLimiter, forgotPasswordLimiter, otpLimiter } = require("../middleware/rateLimiter.js");

const {
  loginUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require("../controllers/authController.js");

router.post("/login", loginLimiter, loginUser);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/verify-otp", otpLimiter, verifyOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
