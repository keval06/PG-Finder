const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect");

const {
  registerBooking,
  updateBooking,
  getMyBookings,
  getReceivedBookings,
} = require("../controllers/booking.js");


router.post("/", protect, registerBooking);
router.get("/my", protect, getMyBookings); //user  
router.get("/received", protect, getReceivedBookings); //owner  
router.patch("/:id", protect, updateBooking);
// router.post("login", loginUser);

module.exports = router;
