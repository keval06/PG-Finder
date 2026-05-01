const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: [3, "Name must be at least 3 characters"],
      maxLength: [32, "Name cannot exceed 32 characters"],
      match: [/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"],
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
      match: /^[6-9]\d{9}$/,
      // maxLength: 10,
      // minLength: 10,
    },

    password: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
