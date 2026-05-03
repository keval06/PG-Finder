const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

exports.protect = async (req, res, next) => {
  try {
    // Check for the token in the Authorization header

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized, no token",
      });
    }
    // Extract just the token part after "Bearer "

    const token = authHeader.split(" ")[1];
    // Verify the token is real and not expired
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    // find user
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        message: "User Not Found",
      });
    }
    // Attach the user's info to the request so the controller can use it
    req.user = user;
    next(); // Pass control to the actual controller
  } catch (error) {
    res.status(401).json({
      message: error.message,
    });
  }
};

// 🛡️ REUSABLE: Same logic as protect, but doesn't block guests
exports.optionalProtect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = await jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    } catch (error) {
      console.warn("optionalProtect: invalid token ignored:", error.message);
    }
  }
  next();
};
