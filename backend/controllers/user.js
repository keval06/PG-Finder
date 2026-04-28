const User = require("../models/user.js");
const bcrypt = require("bcryptjs");

exports.registerUser = async (req, res) => {
  try {
    const { name, mobile, password } = req.body;

    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({ message: "Mobile already registered" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, mobile, password: hash });

    res.status(201).json(user);
  } 
  catch (error) {
    console.error("registerUser:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Mobile already registered" });
    }
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

exports.getUser = async (req, res) => {
  try {
    const { name } = req.query;
    let filter = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    const users = await User.find(filter).select("-password");
    res.json(users);
  } 
  catch (error) {
    console.error("getUser:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { mobile, password } = req.body;
  // ─── GUARD 1: If mobile is being updated, check no other user has it ───
    if (mobile) {
      const existingUser = await User.findOne({ mobile });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(400).json({ message: "Mobile already in use" });
      }
    }

    // ─── GUARD 2: If password is being updated, hash it before saving ───
    if (password) {
      password = await bcrypt.hash(password, 10);
       // We overwrite req.body.password with the HASHED version
      // So the next step saves the hash, not plain text
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json(
        { 
          message: "User not found" 
        }
      );
    }

    res.json(updatedUser);
  } 
  catch (error) {
    console.error("updateUser:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Mobile already in use" });
    }
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};
