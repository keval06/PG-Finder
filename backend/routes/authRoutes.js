const express = require("express");
const router = express.Router();
const { loginLimiter } = require("../middleware/rateLimiter.js");

const {
  loginUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require("../controllers/authController.js");

router.post("/login", loginLimiter, loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
