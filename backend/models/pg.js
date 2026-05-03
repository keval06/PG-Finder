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
      minLength: [2, "Name must be at least 2 characters"],
      maxLength: [16, "Name cannot exceed 16 characters"],
    },

    price: {
      type: Number,
      required: true,
      min: [100, "Price must be at least ₹100"],
      max: [100000, "Price cannot exceed ₹1,00,000"],
    },

    address: {
      type: String,
      required: true,
      trim: true,
      minLength: [10, "Address must be at least 10 characters"],
      maxLength: [256, "Address cannot exceed 256 characters"],
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
        validate: {
          validator: function (v) {
            return (
              v.length === 2 &&
              v[0] >= -180 &&
              v[0] <= 180 && // longitude
              v[1] >= -90 &&
              v[1] <= 90 // latitude
            );
          },
          message: "Invalid coordinates",
        },
      },
    },

    /*{
      "type": "Point",
      "coordinates": [72.8777, 19.0760]
    } */

    city: {
      type: String,
      required: true,
      minLength: [2, "City must be at least 2 characters"],
      maxLength: [32, "City cannot exceed 32 characters"],
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
      min: [1, "Must have at least 1 room"],
      max: [500, "Cannot exceed 500 rooms"],
    },

    bathroom: {
      type: Number,
      required: true,
      min: [1, "Must have at least 1 bathroom"],
      max: [500, "Cannot exceed 500 bathrooms"],
    },

    toilet: {
      type: Number,
      required: true,
      min: [1, "Must have at least 1 toilet"],
      max: [500, "Cannot exceed 500 toilets"],
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
  { timestamps: true },
);

// Indexes for scalable filtering
pgSchema.index({ city: 1, gender: 1, price: 1, isActive: 1 });
pgSchema.index({ amenities: 1 });
pgSchema.index({ coordinate: "2dsphere" }); //? Near Me / radius search

// for getMyPgs — owner dashboard always filters by owner + isActive
pgSchema.index({ owner: 1, isActive: 1 });

// for text search (query.q hits name + city)
pgSchema.index({ name: "text", city: "text" });

// for price range queries alone (minprice/maxprice without city/gender)
pgSchema.index({ isActive: 1, price: 1 });

module.exports = mongoose.model("PG", pgSchema);
