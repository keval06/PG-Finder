const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

exports.protect = async (req, res, next) => {
  try {
    const authHeader =  req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    // extract token
    const token = authHeader.split(" ")[1];
    // verify token
    const decoded =await jwt.verify(token, process.env.JWT_SECRET);

    // find user
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        message: "User Not Found",
      });
    }
    // attach user to request
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      message: error.message,
    });
  }
};
