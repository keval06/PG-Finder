const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.loginUser = async (req, res) => {
  try {
    const { 
        mobile, 
        password 
    } = req.body;

    //Who has not even signed in
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    //incorrect password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const token = jwt.sign(
        { _id: user._id }, 
        process.env.JWT_SECRET, 
        {
          expiresIn: "7d",
        }
      );
         res.json({ token });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
