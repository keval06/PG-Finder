const jwt = require("jsonwebtoken");

const generateToken = (id)=>{
    return jwt.sign(
        {id : id},  // Payload stored INSIDE the token
        process.env.JWT_SECRET,  // Secret key from .env file
        {expiresIn:"7d"}      // Token expires in 7 days
    );
};

module.exports = generateToken;