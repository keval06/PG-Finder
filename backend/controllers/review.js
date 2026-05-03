const Review = require("../models/review.js");
const Booking = require("../models/booking.js");
const mongoose = require("mongoose");
// ─── HELPER ───────────────────────────────────────────────────────────────────
// Check if the logged-in user has ANY booking on this PG (any status)
async function hasBookingOnPG(userId, pgId) {
  // Cast pgId to ObjectId — req.body sends a plain string,
  // Mongoose needs an ObjectId for the comparison to work reliably
  if (!mongoose.Types.ObjectId.isValid(pgId)) {
    console.error("[hasBookingOnPG] Invalid pgId:", pgId);
    return false;
  }
  const pgObjectId = new mongoose.Types.ObjectId(pgId);

  // Debug log — remove after confirming fix
  const booking = await Booking.findOne({
    user: userId,
    pg: pgObjectId,
    status: { $in: ["confirmed", "completed"] },
  });
  // console.log("[hasBookingOnPG] userId:", userId, "pgId:", pgId, "found:", !!booking);
  return !!booking;
}

// ─── CREATE ───────────────────────────────────────────────────────────────────
exports.registerReview = async (req, res) => {
  try {
    const { pg, star, comment } = req.body;

    // 1. Basic field validation
    if (!pg || !star || !comment) {
      return res.status(400).json({ message: "pg, star and comment required" });
    }

    // 2. Booking check — user must have booked this PG to review it
    const booked = await hasBookingOnPG(req.user._id, pg);
    if (!booked) {
      return res.status(403).json({
        message: "You can only review a PG you have booked",
      });
    }

    // 3. Duplicate check — one review per user per PG
    const existingReview = await Review.findOne({ user: req.user._id, pg });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this PG" });
    }

    // 4. Create the review
    const review = await Review.create({
      user: req.user._id,
      pg,
      star,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── READ (paginated) ─────────────────────────────────────────────────────────
exports.getReviewsByPg = async (req, res) => {
  try {
    const { pg, page = 1, limit = 5, sort = "newest" } = req.query;
    if (!pg) {
      return res.status(400).json({
        message: "pg is required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(pg)) {
      return res.status(400).json({
        message: "Invalid pg"
      });
    }
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // page 1 → skip 0,  page 2 → skip 5,  page 3 → skip 10
    const skip = (pageNum - 1) * limitNum;

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      highest: { star: -1 },
      lowest: { star: 1 },
    };
    const sortObj = sortMap[sort] || sortMap.newest;

    const [reviews, total] = await Promise.all([
      Review.find({ pg })
        .populate("user", "name")
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Review.countDocuments({ pg }),
    ]);

    res.json({
      reviews,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── CHECK — can this user review this PG? ────────────────────────────────────
// Frontend calls this on page load to decide what to show:
// - no booking      → hide form entirely
// - has booking     → show submit form
// - already reviewed → show edit/delete form with existing data
exports.canReview = async (req, res) => {
  try {
    const { pg } = req.query;

    // 1. Does user have a booking on this PG?
    const booked = await hasBookingOnPG(req.user._id, pg);
    if (!booked) {
      return res.json({ canReview: false, reason: "no_booking" });
    }

    // 2. Has user already submitted a review?
    const existing = await Review.findOne({ user: req.user._id, pg });
    if (existing) {
      // Send back existing review so frontend can pre-fill edit form
      return res.json({
        canReview: false,
        reason: "already_reviewed",
        review: existing,
      });
    }

    res.json({ canReview: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Only the author can edit
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // 🛡️ SECURITY: Prevent Mass Assignment (Allow ONLY star and comment)
    const allowedFields = ["star", "comment"];
    const updateData = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      updateData, // ← Securely filtered
      { new: true, runValidators: true },
    );

    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Only the author can delete
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
