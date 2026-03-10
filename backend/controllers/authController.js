<<<<<<< HEAD
const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken.js");

exports.loginUser = async (req, res) => {
  try {
    const { mobile, password } = req.body;
    const user = await User.findOne({ mobile });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      mobile: user.mobile,
      token,
    });
  } 
  catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};
=======
const User = require("../models/user.js")
>>>>>>> 190069461300ab0af82c0feea93673fabd9ed355
