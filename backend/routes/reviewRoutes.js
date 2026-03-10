const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect");

const {
  registerReview,
  updateReview,
  getReviewsByPg,
} = require("../controllers/review.js");

<<<<<<< HEAD
router.post("/", protect, registerReview);
router.get("/", getReviewsByPg);
router.patch("/:id",protect, updateReview);
=======
router.post("/",  registerReview);
router.get("/", getReviewsByPg);
router.patch("/:id", updateReview);
>>>>>>> 190069461300ab0af82c0feea93673fabd9ed355

module.exports = router;
