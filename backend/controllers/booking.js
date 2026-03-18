const Booking = require("../models/booking.js");
const RoomType = require("../models/roomType.js");
const PG = require("../models/pg.js");
const mongoose = require("mongoose");

exports.registerBooking = async (req, res) => {
  // start session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      pg,
      roomType: roomTypeId,
      checkInDate,
      checkOutDate,
      amount,
    } = req.body;

    // check if booking dates are valid
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid booking dates" });
    }

    // check if room type exists
    const roomType = await RoomType.findById(roomTypeId).session(session);
    if (!roomType) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Room type not found" });
    }

    // check if beds are available
    const totalBeds = roomType.availableRooms * roomType.sharingCount;
    const remainingBeds = totalBeds - roomType.occupiedBeds;

    // check if booking is valid
    if (remainingBeds < 1) {
      await session.abortTransaction();
      return res.status(400).json({ message: "No beds available" });
    }

    // check if booking already exists
    const existingBooking = await Booking.findOne({
      user: req.user._id,
      pg,
      roomType: roomTypeId, // ← same room type only
      status: { $nin: ["cancelled", "completed"] }, // ← ignore cancelled/completed
      checkInDate: { $lte: checkOutDate },
      checkOutDate: { $gte: checkInDate },
    }).session(session);

    if (existingBooking) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Booking already exists" });
    }

    // create booking
    const booking = await Booking.create(
      [
        {
          user: req.user._id,
          pg,
          roomType: roomTypeId,
          checkInDate,
          checkOutDate,
          amount,
        },
      ],
      { session },
    );

    // update room type
    await RoomType.findByIdAndUpdate(
      roomTypeId,
      { $inc: { occupiedBeds: 1 } },
      { session },
    );

    // commit transaction
    await session.commitTransaction();
    res.status(201).json(booking[0]);
  } catch (error) {
    // abort transaction
    await session.abortTransaction();
    res.status(500).json(error);
  } finally {
    // end session
    session.endSession();
  }
};

// after — user sees own, owner sees their PG's bookings
exports.getMyBookings = async (req, res) => {
  try {
    // get bookings
    const bookings = await Booking.find({ user: req.user._id })
      .populate("pg", "name price city")
      .populate("roomType", "name sharingCount price");
    res.json(bookings);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

exports.getReceivedBookings = async (req, res) => {
  try {
    // get bookings
    const myPgs = await PG.find({ owner: req.user._id }).select("_id");
    const pgIds = myPgs.map((pg) => pg._id);

    const bookings = await Booking.find({ pg: { $in: pgIds } })
      .populate("user", "name mobile") // populate user
      .populate("pg", "name city") // populate pg
      .populate("roomType", "name sharingCount price"); // populate room type

    res.json(bookings);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

exports.updateBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // if booking is not found
    const existing = await Booking.findById(req.params.id).session(session);
    if (!existing) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Booking not found" });
    }

    // if booking is updated
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      session,
    });

    // if user cancels booking
    if (req.body.status === "cancelled" && existing.status !== "cancelled") {
      await RoomType.findByIdAndUpdate(
        existing.roomType,
        { $inc: { occupiedBeds: -1 } },
        { session },
      );
    }

    // if booking is confirmed
    else if (
      req.body.status === "confirmed" &&
      existing.status === "cancelled"
    ) {
      // if room type is not found
      const roomType = await RoomType.findById(existing.roomType).session(
        session,
      );
      if (!roomType) {
        await session.abortTransaction();
        return res.status(404).json({ message: "Room type not found" });
      }

      // if no beds available
      const totalBeds = roomType.availableRooms * roomType.sharingCount;
      const remainingBeds = totalBeds - roomType.occupiedBeds;

      if (remainingBeds < 1) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({ message: "No beds available to restore booking" });
      }

      // if beds are available
      await RoomType.findByIdAndUpdate(
        existing.roomType,
        { $inc: { occupiedBeds: 1 } },
        { session },
      );
    }

    await session.commitTransaction();
    res.json(booking);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json(error);
  } finally {
    session.endSession();
  }
};
