const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    pg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PG",
      required: true,
    },

    url: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ["room", "kitchen", "bathroom", "toilet", "building", "amenities"],
      default: "room",
      required: true,
    },
  },
  { timestamps: true }
);

imageSchema.index({ pg: 1, category: 1 });
module.exports = mongoose.model("Image", imageSchema);
