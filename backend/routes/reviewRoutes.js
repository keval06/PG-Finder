const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect");

const {
  registerReview,
  updateReview,
  getReviewsByPg,
} = require("../controllers/review.js");

router.post("/", registerReview);
router.get("/", getReviewsByPg);
router.patch("/:id", updateReview);

module.exports = router;
