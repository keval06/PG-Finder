const cron = require("node-cron");
const mongoose = require("mongoose");
const Booking = require("../models/booking");
const RoomType = require("../models/roomType");

// Every 30 minutes — clean abandoned pending bookings
cron.schedule("*/30 * * * *", async () => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    await Booking.updateMany(
      {
        status: "pending",
        paymentStatus: "pending",
        createdAt: { $lt: thirtyMinutesAgo },
      },
      { $set: { status: "cancelled" } },
    );
    console.log("Stale pending bookings cleaned up.");
  } 
  catch (error) {
    console.error("Error cleaning stale pending bookings:", error);
  }
});

// Every day at midnight — mark confirmed+expired bookings as completed
cron.schedule("0 0 * * *", async () => {
  console.log("Running daily booking cleanup cron job...");
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiredBookings = await Booking.find({
      status: "confirmed",
      checkOutDate: { $lt: today },
    });

    if (expiredBookings.length === 0) {
      console.log("No expired bookings to clean up today.");
      return;
    }

    console.log(`Found ${expiredBookings.length} expired bookings. Cleaning up...`);

    for (const booking of expiredBookings) {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const result = await Booking.findOneAndUpdate(
          { _id: booking._id, status: "confirmed" },
          { $set: { status: "completed" } },
          { session },
        );

        if (result) {
          await RoomType.findByIdAndUpdate(
            booking.roomType,
            { $inc: { occupiedBeds: -1 } },
            { session },
          );
          console.log(`Cleaned up booking ${booking._id}`);
        }

        await session.commitTransaction();
      } 
      catch (err) {
        await session.abortTransaction();
        console.error(`Failed to clean up booking ${booking._id}:`, err);
      } 
      finally {
        session.endSession();
      }
    }

    console.log("Booking cleanup finished successfully.");
  } 
  catch (error) {
    console.error("Error running daily booking cleanup:", error);
  }
});