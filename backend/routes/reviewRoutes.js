const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect");

const {
  registerReview,
  getReviewsByPg,
  canReview,
  updateReview,
  deleteReview,
} = require("../controllers/review.js");

router.post("/", protect, registerReview); // create  — must be booked
router.get("/", getReviewsByPg); // read    — public, paginated
router.get("/can-review", protect, canReview); // check   — can this user review?
router.patch("/:id", protect, updateReview); // update  — author only
router.delete("/:id", protect, deleteReview); // delete  — author only

module.exports = router;
