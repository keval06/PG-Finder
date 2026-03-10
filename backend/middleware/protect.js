const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

<<<<<<< HEAD
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
=======

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log(req.headers.authorization);

    if(!authHeader || authHeader.startsWith("Bearer ")){
        return res.status(401).json({
            message :"Not Authorized"
        });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("This is decode"+ decoded);


    const user = await User.findById(decoded._id).select("-password");
    console.log(decoded._id);

    if(!user){
        return res.status(401).json({
            message :"User Not Found"
        });
    }
    req.user = user;
    next();

  } catch (error) {
    res.status(401).json(
        err.message
    );
>>>>>>> 190069461300ab0af82c0feea93673fabd9ed355
  }
};
