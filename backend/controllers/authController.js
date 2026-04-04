const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken.js");

exports.loginUser = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    const user = await User.findOne( {mobile: mobile });

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
  } 
  catch (error) {
    res.status(500).json(
      { 
     
      message:error.message 
      }
  );
  }
};
