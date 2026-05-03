const User = require("../models/user.js");
const bcrypt = require("bcryptjs");

exports.registerUser = async (req, res) => {
  try {
    const { name, mobile, email, password } = req.body;
    //Password validation
    const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be 8-16 characters and contain at least one digit and one special character.",
      });
    }

    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({ message: "Mobile already registered" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, mobile, email, password: hash });

    //? password should never leave server, even hashed
    const { password : _, ...safeUser} = user.toObject(); 
    res.status(201).json(safeUser);
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
  } catch (error) {
    console.error("getUser:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ 
        message: "Not allowed to update another user's profile" 
      });
    }
    const { mobile, currentPassword, newPassword } = req.body;
    // ─── GUARD 1: If mobile is being updated, check no other user has it ───
    if (mobile) {
      const existingUser = await User.findOne({ mobile });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(400).json({ message: "Mobile already in use" });
      }
    }

    // ─── GUARD 2: If password is being updated, hash it before saving ───


    let hashedNewPassword = null;
    if (newPassword) {
      // Verify current password first
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect." });
      }
      //   // We overwrite req.body.password with the HASHED version
      //   // So the next step saves the hash, not plain text
      const passwordRegex =
        /^(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          message:
            "New password must be 8-16 characters and contain at least one digit and one special character.",
        });
      }
      hashedNewPassword = await bcrypt.hash(newPassword, 10);
    }

    // 🛡️ SECURITY: build updateData dynamically to support PARTIAL updates
    const allowedFields = ["name", "mobile"];
    const updateData = {};

    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    // Handle Password separately: Use the HASHED local variable if it exists
    if (hashedNewPassword) {
      updateData.password = hashedNewPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData, // ← Only contains fields the user actually sent
      {
        new: true,
        runValidators: true,
      },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("updateUser:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Mobile already in use" });
    }
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};
