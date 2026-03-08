const mongoose = require("mongoose");

const pgSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  name: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 32,
  },

  price: {
    type: Number,
    required: true,
  },

  address: {
    type: String,
    required: true,
    minLength: 10,
    maxLength: 256,
  },

  coordinate: {
    type: [Number],
    required: true,
  },

  city: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 64,
  },

  gender: {
    type: String,
    enum: ["male", "female", "mix"],
    default: "male",
    required: true,
  },

  room: {
    type: Number,
    required: true,
  },

  bathroom: {
    type: Number,
    required: true,
  },

  toilet: {
    type: Number,
    required: true,
  },

  food: {
    type: String,
    enum: ["with food", "without food", "flexible"],
    default: "flexible",
    required: true,
  },

  amenities: {
    type: [String],
    enum: [
      "Parking",
      "WiFi",
      "AC",
      "Laundry",
      "Lift",
      "CCTV",
      "RO",
      "TV",
      "Refrigerator",
      "Gym",
      "Garden",
      "Library",
    ],
    default: ["Parking", "Lift", "CCTV"],
    required: true,
  },
});
module.exports = mongoose.model("PG", pgSchema);
