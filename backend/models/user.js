const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 32,
    },

    mobile: {
      type: Number,
      required: true,
      unique: true,
      match : /^[0-9]{10}$/
      // maxLength: 10,
      // minLength: 10,
    },

    password: {
      type: String,
      required: true,
      minLength: 8,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
