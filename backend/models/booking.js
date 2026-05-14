const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    pg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PG",
      required: true,
    },

    roomType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomType",
      required: true,
    },

    checkInDate: {
      type: Date,
      required: true,
    },

    checkOutDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"], // [booked but no payment, payment succeed, user or owner cancelled, past booking]
      default: "pending",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"]
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      required: true,
    },

    razorpayOrderId: {  //orderId to match webhook to booking
      type: String,
      default: null,
    },

    razorpayPaymentId: {  //  paymentId is the receipt for refunds
      type: String,
      default: null,
    },
  },

  { timestamps: true },
);

// Indexing for fast dashboard loading
bookingSchema.index({ user: 1, createdAt: -1 }); // user's booking history (latest first)
bookingSchema.index({ pg: 1, createdAt: -1 });    // owner's PG booking dashboard
bookingSchema.index({ status: 1 });               // admin: filter by status

module.exports = mongoose.model("Booking", bookingSchema);
