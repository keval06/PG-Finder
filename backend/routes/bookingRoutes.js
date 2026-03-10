const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect");

const {
  registerBooking,
  updateBooking,
  getBooking,
} = require("../controllers/booking.js");

router.post("/",protect, registerBooking);
router.get("/", protect ,getBooking);
router.patch("/:id",protect, updateBooking);
// router.post("login", loginUser);

module.exports = router;
