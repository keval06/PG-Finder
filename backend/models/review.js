const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    pg: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "PG",
    },

    star: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      minLength: 3,
      maxLength: 256,
      required: true,
    },
  },
  { timestamps: true }
);
reviewSchema.index({ pg: 1 }); // speeds up $lookup in pg controller
reviewSchema.index({ user: 1, pg: 1 }, { unique: true }); // also enforces one review per user per PG at DB level
module.exports = mongoose.model("Review", reviewSchema);
