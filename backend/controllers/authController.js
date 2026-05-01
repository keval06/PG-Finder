const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const OTP = require("../models/otp.js");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendOtpEmail } = require("../utils/sendOtpEmail.js");
const {
  generateResetToken,
  generateToken,
} = require("../utils/generateToken.js");

exports.loginUser = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    const user = await User.findOne({ mobile: mobile });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    // STEP 4: Create a JWT token with the user's ID inside
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      mobile: user.mobile,
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// 1. FORGOT PASSWORD — send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Security: don't reveal if email exists or not
      return res
        .status(200)
        .json({ message: "If this email exists, an OTP has been sent." });
    }

    
    // new — padStart ensures always 4 digits
    const rawOtp = crypto.randomInt(1000, 10000).toString().padStart(4, "0");
    // Hash it before storing
    const hashedOtp = await bcrypt.hash(rawOtp, 10);

    // Invalidate any previous unused OTPs for this email
    await OTP.updateMany({ email, isUsed: false }, { isUsed: true });

    // Save new OTP
    await OTP.create({
      email,
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // Send email
    await sendOtpEmail(email, rawOtp);

    res.status(200).json({ message: "OTP sent to your email." });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ message: "Failed to send OTP. Try again." });
  }
};

// 2. VERIFY OTP — validate and return reset token
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find latest unused unexpired OTP
    const otpRecord = await OTP.findOne({
      email,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: "OTP expired or invalid." });
    }

    // Compare
    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect OTP." });
    }

    // Mark as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Issue short-lived reset token
    const resetToken = generateResetToken(email);

    res.status(200).json({ resetToken });
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    res.status(500).json({ message: "Verification failed." });
  }
};

// 3. RESET PASSWORD — set new password
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET + "_reset");
    } catch {
      return res
        .status(400)
        .json({ message: "Reset link expired. Request a new OTP." });
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successful." });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ message: "Failed to reset password." });
  }
};
