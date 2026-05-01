const Razorpay = require("razorpay");
const Booking = require("../models/booking.js");
const crypto = require("crypto");
const RoomType = require("../models/roomType.js")

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    // 1. Fetch with validation
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // 2. THE CRITICAL FIX: Ownership Verification
    // Logic: Compare the booking's owner to the currently logged-in user.
    // Why .toString()? Because MongoDB ObjectIDs are objects, they won't match strings using ===
    if (booking.user.toString() !== req.user._id.toString()) {
      console.warn(
        `UNAUTHORIZED ACCESS ATTEMPT: User ${req.user._id} tried to pay for Booking ${bookingId}`,
      );
      return res.status(403).json({
        success: false,
        message: "Access Denied. You can only pay for your own bookings.",
      });
    }

    // EDGE CASE: Check if already paid
    if (booking.paymentStatus === "paid") {
      return res
        .status(400)
        .json({ success: false, message: "This booking is already paid." });
    }

    // EDGE CASE: Check if cancelled
    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot pay for a cancelled booking.",
      });
    }

    // 2. Reuse existing Order ID (Idempotency)
    // If user returns to pay again, don't create a new order unless necessary
    // new
    if (booking.razorpayOrderId) {
      const existingOrder = await razorpay.orders.fetch(
        booking.razorpayOrderId,
      );
      return res.status(200).json(existingOrder);
    }

    // 3. Create Order with Razorpay
    // Logic: Convert to Paise and ensure it's a rounded Integer
    const amountInPaise = Math.round(booking.amount * 100);
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${bookingId.toString().substring(0, 15)}`, // Logic: Unique receipt per booking
    };
    const order = await razorpay.orders.create(options);

    // 4. Persistence
    // Logic: Store the ID in our DB so we have a reference for the Webhook later
    booking.razorpayOrderId = order.id;
    await booking.save();
    res.status(200).json(order);
  } catch (error) {
    console.error("RAZORPAY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Gateway error. Please try again later.",
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // 1. Fetch Booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking record not found" });
    }

    // Verify the order ID matches what we stored — prevents cross-order signature replay
    if (booking.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Order ID mismatch",
      });
    }

    // 2. THE CRITICAL FIX: Ownership Verification
    // Logic: Compare the booking's owner to the currently logged-in user.
    // Why .toString()? Because MongoDB ObjectIDs are objects, they won't match strings using ===
    if (booking.user.toString() !== req.user._id.toString()) {
      console.warn(
        `UNAUTHORIZED ACCESS ATTEMPT: User ${req.user._id} tried to pay for Booking ${bookingId}`,
      );
      return res.status(403).json({
        success: false,
        message: "Access Denied. You can only pay for your own bookings.",
      });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified.",
        data: booking,
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpay_signature),
    );
    if (!isAuthentic) {
      // EDGE CASE: Security Alert
      // Logic: Log this specifically. This is likely a tampering attempt.
      console.warn(
        "CRITICAL: PAYMENT SIGNATURE MISMATCH FOR BOOKING:",
        bookingId,
      );
      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Invalid signature.",
      });
    }

    // 3. Update Database
    // EDGE CASE: Ensure we don't overwrite a status if it was changed by an admin
    // new
    const updatedRoomType = await RoomType.findOneAndUpdate(
      {
        _id: booking.roomType,
        $expr: {
          $lt: [
            "$occupiedBeds",
            { $multiply: ["$availableRooms", "$sharingCount"] },
          ],
        },
      },
      { $inc: { occupiedBeds: 1 } },
      { new: true },
    );

    if (!updatedRoomType) {
      return res.status(400).json({
        success: false,
        message:
          "Room is now full. Payment received but bed could not be assigned. Please contact support.",
      });
    }

    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    booking.razorpayPaymentId = razorpay_payment_id;

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Payment verified and booking confirmed.",
      data: booking,
    });
  } catch (error) {
    console.error("VERIFICATION ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying payment.",
    });
  }
};

exports.handleWebhook = async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];

  // 1. Verify webhook is actually from Razorpay
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  const isAuthentic = crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature),
  );

  if (!isAuthentic) {
    console.warn("INVALID WEBHOOK SIGNATURE");
    return res.status(400).json({ message: "Invalid signature" });
  }

  // 2. Handle the event
  const event = req.body.event;
  const paymentEntity = req.body.payload.payment.entity;

  if (event === "payment.captured") {
    const razorpay_order_id = paymentEntity.order_id;
    const razorpay_payment_id = paymentEntity.id;

    const booking = await Booking.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Idempotency — don't process if already confirmed
    if (booking.paymentStatus === "paid") {
      return res.status(200).json({ message: "Already processed" });
    }

    const updatedRoomType = await RoomType.findOneAndUpdate(
      {
        _id: booking.roomType,
        $expr: {
          $lt: [
            "$occupiedBeds",
            { $multiply: ["$availableRooms", "$sharingCount"] },
          ],
        },
      },
      { $inc: { occupiedBeds: 1 } },
      { new: true },
    );

    if (!updatedRoomType) {
      console.error("WEBHOOK: Room full for booking", booking._id);
      return res.status(400).json({ message: "Room full" });
    }

    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    booking.razorpayPaymentId = razorpay_payment_id;
    await booking.save();

    console.log("WEBHOOK: Booking confirmed", booking._id);
  }

  res.status(200).json({ message: "OK" });
};
