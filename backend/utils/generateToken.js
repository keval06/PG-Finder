const jwt = require("jsonwebtoken");
const user = require("../models/user");

const generateToken = (id)=>{
    return jwt.sign(
        {id : id},
        process.env.JWT_SECRET,
        {expiresIn:"7d"}
    );
};

module.exports = generateToken;