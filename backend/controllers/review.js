const Review = require("../models/review.js");

exports.registerReview = async (req, res) => {
  try {
    const { pg, star, comment } = req.body;

    if (!pg || !star || !comment) {
      return res.status(400).json({
        message: "pg, star and comment required",
      });
    }

    const existingReview = await Review.findOne({
      user: req.user._id,
      pg,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "Already reviewed",
      });
    }

    const review = await Review.create({
      user: req.user._id,
      pg,
      star,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

exports.getReviewsByPg = async (req, res) => {
  try {
    const { pg } = req.query;

    const reviews = await Review.find({ pg })
      .populate("user", "name")
      .populate("pg", "name city");

    res.json(reviews);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not allowed",
      });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedReview);
  } catch (error) {
    res.status(500).json(error.message);
  }
};
