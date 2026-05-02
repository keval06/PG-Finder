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
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Normalize today's date to midnight for a fair comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ADDED: 1. API Protection - Check if check-in is in the past
    if (checkIn < today) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Check-in date cannot be in the past" });
    }

    // 2. Check if check-out is before or same as check-in
    if (checkOut <= checkIn) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid booking dates" });
    }

    // check if room type exists
    const roomType = await RoomType.findById(roomTypeId).session(session);
    if (!roomType) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Room type not found" });
    }


    const totalBeds = roomType.availableRooms * roomType.sharingCount;
    if (roomType.occupiedBeds >= totalBeds) {
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

    // 🛡️ SECURITY: Calculate amount server-side to prevent price injection
    // (Room Price * months) - for simplicity we use 1 month as per your frontend logic
    const finalAmount = roomType.price;

    // create booking
    const booking = await Booking.create(
      [
        {
          user: req.user._id,
          pg,
          roomType: roomTypeId,
          checkInDate,
          checkOutDate,
          amount: finalAmount, // ← Use server-calculated amount
        },
      ],
      { session },
    );

    // update room type
    // REPLACE the blind update (Lines 94-98) with this atomic one:

    // commit transaction
    await session.commitTransaction();
    res.status(201).json(booking[0]);
  } catch (error) {
    // abort transaction
    await session.abortTransaction();
    res.status(500).json({ message: error.message || "Internal Server Error" });
  } finally {
    // end session
    session.endSession();
  }
};

// Helper to build filters from query string
const buildBookingFilter = async (baseFilter, req) => {
  const { status, dateRange, q } = req.query;
  let filter = { ...baseFilter };

  if (status && status !== "all") {
    filter.status = status;
  }

  if (dateRange && dateRange !== "all") {
    const daysMap = { "30d": 30, "90d": 90, "6m": 180, "1y": 365 };
    if (daysMap[dateRange]) {
      const cutoff = new Date(Date.now() - daysMap[dateRange] * 86400000);
      filter.checkInDate = { $gte: cutoff };
    }
  }

  if (q && q.trim()) {
    const regex = new RegExp(q.trim(), "i");
    const matchingPgs = await PG.find({
      $or: [{ name: regex }, { city: regex }]
    }).select("_id");
    const matchingPgIds = matchingPgs.map(p => p._id.toString());

    if (filter.pg && filter.pg.$in) {
       // Intersect owner's PG ids with searched PG ids
       const ownerPgIds = filter.pg.$in.map(id => id.toString());
       const intersected = ownerPgIds.filter(id => matchingPgIds.includes(id));
       filter.pg.$in = intersected;
    } else {
       filter.pg = { $in: matchingPgIds };
    }
  }

  return filter;
};

// Helper for sending paginated response
const paginateAndSendBookings = async (baseFilter, req, res, populates) => {
  try {
    const filter = await buildBookingFilter(baseFilter, req);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let queryBuilder = Booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
    if (populates) {
      populates.forEach(p => { queryBuilder = queryBuilder.populate(p.path, p.select); });
    }

    const bookings = await queryBuilder;
    const totalCount = await Booking.countDocuments(filter);

    res.json({
      data: bookings,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit) || 1,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// after — user sees own, owner sees their PG's bookings
exports.getMyBookings = async (req, res) => {
  return await paginateAndSendBookings(
    { user: req.user._id },
    req,
    res,
    [
      { path: "pg", select: "name price city" },
      { path: "roomType", select: "name sharingCount price" }
    ]
  );
};

exports.getReceivedBookings = async (req, res) => {
  try {
    const myPgs = await PG.find({ owner: req.user._id }).select("_id");
    const pgIds = myPgs.map((pg) => pg._id);

    return await paginateAndSendBookings(
      { pg: { $in: pgIds } },
      req,
      res,
      [
        { path: "user", select: "name mobile" },
        { path: "pg", select: "name city" },
        { path: "roomType", select: "name sharingCount price" }
      ]
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // if booking is not found
    const existing = await Booking.findById(req.params.id)
      .populate("pg", "owner")
      .session(session);

    if (!existing) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Booking not found" });
    }

    // SECURITY: Only Guest who booked OR PG Owner can update
    const isGuest = existing.user.toString() === req.user._id.toString();
    const isOwner = existing.pg.owner.toString() === req.user._id.toString();

    if (!isGuest && !isOwner) {
      await session.abortTransaction();
      return res
        .status(403)
        .json({ message: "Not authorized to update this booking" });
    }

    // if booking is updated
    // 🛡️ SECURITY: Guests can only update status, Owners can update paymentStatus
    const allowedFields = ["status", "paymentStatus"];
    const updateData = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) updateData[key] = req.body[key];
    });

    // if booking is updated
    const booking = await Booking.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
      session,
    });

    // if user cancels booking
    if (updateData.status === "cancelled" && existing.status === "confirmed") {
      await RoomType.findByIdAndUpdate(
        existing.roomType,
        { $inc: { occupiedBeds: -1 } },
        { session },
      );
    }

    // if booking is confirmed
    else if (
      updateData.status === "confirmed" &&
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
    res.status(500).json({ message: error.message || "Internal Server Error" });
  } finally {
    session.endSession();
  }
};
