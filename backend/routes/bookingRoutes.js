const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect");

const {
  registerBooking,
  updateBooking,
  getMyBookings,
  getReceivedBookings,
} = require("../controllers/booking.js");


router.post("/", protect, registerBooking);            //Guest creates booking
router.get("/my", protect, getMyBookings);              //Guest sees own bookings
router.get("/received", protect, getReceivedBookings); //Owner sees bookings on their PGs
router.patch("/:id", protect, updateBooking);         //Guest cancels / Owner confirms

module.exports = router;
