const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect");

const {
  registerBooking,
  updateBooking,
  getBooking,
} = require("../controllers/booking.js");

router.post("/", registerBooking);
router.get("/", getBooking);
router.patch("/:id", updateBooking);
// router.post("login", loginUser);

module.exports = router;
