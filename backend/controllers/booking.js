const Booking = require("../models/booking.js");

exports.registerBooking = async (req, res) => {
  try {
    const { pg, checkInDate, checkOutDate, amount } = req.body;

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      return res.status(400).json({
        message: "Invalid booking dates",
      });
    }

    const existingBooking = await Booking.findOne({
      user: req.user._id,
      pg,
      checkInDate: { $lte: checkOutDate },
      checkOutDate: { $gte: checkInDate },
    });

    if (existingBooking) {
      return res.status(400).json({
        message: "Booking already exists",
      });
    }

    const booking = await Booking.create({
      user: req.user._id,
      pg,
      checkInDate,
      checkOutDate,
      amount,
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.getBooking = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name mobile")
      .populate("pg", "name price city");

    res.json(bookings);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json(error);
  }
};
