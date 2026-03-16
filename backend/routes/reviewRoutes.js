const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect");

const {
  registerReview,
  updateReview,
  getReviewsByPg,
} = require("../controllers/review.js");

router.post("/", protect, registerReview);
router.get("/", getReviewsByPg);
router.patch("/:id",protect, updateReview);

module.exports = router;
