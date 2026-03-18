const mongoose = require("mongoose");

const roomTypeSchema = new mongoose.Schema(
  {
    pg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PG",
      required: true,
    },

    name: {
      type: String,
      required: true,
      enum: ["regular", "deluxe", "luxurious", "premium", "suite"],
      default: "regular",
    },

    sharingCount: {
      type: Number,
      required: true,
      min: [1, "Sharing count must be at least 1"],
      max: [10, "Sharing count cannot exceed 10"],
    },

    availableRooms: {
      type: Number,
      required: true,
      min: [0, "Available rooms cannot be negative"],
    },

    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    
    occupiedBeds: {
      type: Number,
      default: 0,
      min: [0, "Occupied beds cannot be negative"],
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("RoomType", roomTypeSchema);
