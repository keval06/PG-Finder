const cron = require("node-cron");
const Booking = require("../models/booking");
const RoomType = require("../models/roomType");

// Run every day at midnight (0 0 * * *)
cron.schedule("0 0 * * *", async () => {
  console.log("Running daily booking cleanup cron job...");
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    // Find all active/confirmed bookings where the checkout date is in the past
    const expiredBookings = await Booking.find({
      status: "confirmed",
      checkOutDate: { $lt: today },
    });

    if (expiredBookings.length === 0) {
      console.log("No expired bookings to clean up today.");
      return;
    }

    console.log(
      `Found ${expiredBookings.length} expired bookings. Cleaning up...`,
    );

    for (const booking of expiredBookings) {
      // 1. Atomically mark as completed ONLY if it was still confirmed
      const result = await Booking.findOneAndUpdate(
        { _id: booking._id, status: "confirmed" },
        { $set: { status: "completed" } },
      );

      // 2. ONLY if the booking was actually updated by this process, free the bed
      if (result) {
        await RoomType.findByIdAndUpdate(booking.roomType, {
          $inc: { occupiedBeds: -1 },
        });
        console.log(`Cleaned up booking ${booking._id}`);
      }
    }

    console.log("Booking cleanup finished successfully.");
  } catch (error) {
    console.error("Error running booking cleanup cron job:", error);
  }
});
