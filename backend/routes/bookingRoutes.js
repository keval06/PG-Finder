const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect");

const {
  registerBooking,
  updateBooking,
  getBooking,
} = require("../controllers/booking.js");

<<<<<<< HEAD
router.post("/",protect, registerBooking);
router.get("/", protect ,getBooking);
router.patch("/:id",protect, updateBooking);
=======
router.post("/", registerBooking);
router.get("/", getBooking);
router.patch("/:id", updateBooking);
>>>>>>> 190069461300ab0af82c0feea93673fabd9ed355
// router.post("login", loginUser);

module.exports = router;
