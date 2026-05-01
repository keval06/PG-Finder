const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },

  otp: {
    type: String,
    required: true, // stored as bcrypt hash
  },

  isUsed: {
    type: Boolean,
    default: false,
  },

  expiresAt: {
    type: Date,
    required: true,
  },
  
});

// Auto delete expired OTPs from DB
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("OTP", otpSchema);