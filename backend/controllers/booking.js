const Booking = require("../models/booking.js");

exports.registerBooking = async (req, res) => {
  try {
    const {
      user,
      pg,
      checkInDate,
      checkOutDate,
      status,
      amount,
      paymentStatus,
    } = req.body;

    const existingBooking = await Booking.findOne({
      user,
      pg,
      checkInDate: { $lte: checkOutDate },
      checkOutDate: { $gte: checkInDate },
    });

    if (existingBooking) {
      return res.status(400).json({
        message: "Booking already exists",
      });
    }

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      return res.status(400).json({
        message: "Check-out must be after check-in",
      });
    }
    const booking = await Booking.create({
      user,
      pg,
      checkInDate,
      checkOutDate,
      status,
      amount,
      paymentStatus,
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getBooking = async (req, res) => {
  try {
    const { user, pg, checkInDate, checkOutDate, status, paymentStatus } =
      req.query;

    let baseFilter = {};

    // Date filtering
    if (checkInDate && checkOutDate) {
      // Overlapping bookings
      baseFilter.$and = [
        { checkInDate: { $lte: new Date(checkOutDate) } },
        { checkOutDate: { $gte: new Date(checkInDate) } },
      ];
    } 
    else if (checkInDate) {
      baseFilter.checkInDate = { $gte: new Date(checkInDate) };
    } 
    else if (checkOutDate) {
      baseFilter.checkInDate = { $lte: new Date(checkOutDate) };
    }

    if (status) {
      baseFilter.status = { $regex: status, $options: "i" };
    }

    if (paymentStatus) {
      baseFilter.paymentStatus = {
        $regex: paymentStatus,
        $options: "i",
      };
    }

    let query = Booking.find(baseFilter)
      .populate({
        path: "user",
        match: user ? { name: { $regex: user, $options: "i" } } : {},
        select: "name mobile",
      })
      .populate({
        path: "pg",
        match: pg ? { name: { $regex: pg, $options: "i" } } : {},
        select: "name price city",
      });

    const bookings = await query;

    // Remove unmatched populated results
    const filtered = bookings.filter((b) => b.user !== null && b.pg !== null);

    res.json(filtered);
  } catch (error) {
    res.status(400).json(error.message);
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
  } catch (err) {
    res.status(500).json(err);
  }
};
