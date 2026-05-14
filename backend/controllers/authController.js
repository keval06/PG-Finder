const User = require("../models/user.js");
const OTP = require("../models/otp.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendOtpEmail } = require("../utils/sendOtpEmail.js");
const {
  generateToken,
  generateResetToken,
} = require("../utils/generateToken.js");

exports.loginUser = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    const user = await User.findOne({ mobile });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }
    // STEP 4: Create a JWT token with the user's ID inside
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// 1. FORGOT PASSWORD — send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "No account found with this email.",
      });
    }

    // Cooldown — prevent OTP spam (max 1 per 60 seconds per email)
    const recentOtp = await OTP.findOne({
      email,
      isUsed: false,
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) },
    });
    if (recentOtp) {
      return res.status(429).json({
        message:
          "OTP already sent. Please wait 60 seconds before requesting again.",
      });
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

    res.status(200).json({
      message: "OTP sent to your email.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send OTP. Try again.",
    });
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
    }).sort({ createdAt: -1 }); //two valid OTPs exist, Sort descending → get latest.

    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP expired or invalid.",
      });
    }

    // Compare
    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect OTP.",
      });
    }

    // Mark as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Issue short-lived reset token
    const resetToken = generateResetToken(email);

    res.status(200).json({ resetToken });
  } catch (error) {
    res.status(500).json({
      message: "Verification failed.",
    });
  }
};

// 3. RESET PASSWORD — set new password
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Verify reset token
    // Separates known JWT errors (400)
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET_RESET);
    } catch {
      return res.status(400).json({
        message: "Reset link expired. Request a new OTP.",
      });
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be 8-16 characters with at least one digit and one special character.",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: "Password reset successful.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reset password.",
    });
  }
};
