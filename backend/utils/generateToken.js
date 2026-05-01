const jwt = require("jsonwebtoken");

exports.generateToken = (id)=>{
    return jwt.sign(
        {id : id},  // Payload stored INSIDE the token
        process.env.JWT_SECRET,  // Secret key from .env file
        {expiresIn:"7d"}      // Token expires in 7 days
    );
};

exports.generateResetToken = (email) => {
  return jwt.sign(
    { email },
    process.env.JWT_SECRET + "_reset",
    { expiresIn: "15m" }
  );
};