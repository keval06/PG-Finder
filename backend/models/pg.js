const mongoose = require("mongoose");

const pgSchema = new mongoose.Schema(
  {
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
      //? GeoJSON
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], //[long, lat]
        required: true,
      },
    },

    /*{
      "type": "Point",
      "coordinates": [72.8777, 19.0760]
    } */

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

    isActive: {
      type: Boolean,
      default: true,
    }, // ← NEW: false = hidden from home page, SOFT Deletion
  },
  { timestamps: true }
);

// Indexes for scalable filtering
pgSchema.index({ city: 1, gender: 1, price: 1, isActive: 1 });
pgSchema.index({ amenities: 1 });
pgSchema.index({ owner: 1 });
pgSchema.index({ coordinate: "2dsphere" }); //? Near Me / radius search

module.exports = mongoose.model("PG", pgSchema);
