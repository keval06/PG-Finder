const Review = require("../models/review.js");

exports.registerReview = async (req, res) => {
  const { pg, star, comment } = req.body;

  if (!pg || !star || !comment) {
    return res.status(400).json({
      message: "pg, star and comment required",
    });
  }

  const user = req.user.id; // from JWT middleware

  const existingReview = await Review.findOne({
    user,
    pg,
  });

  if (existingReview) {
    return res.status(400).json({
      message: "You already reviewed this PG",
    });
  }

  try {
    const review = await Review.create({
      user,
      pg,
      star,
      comment,
    });

    if (!review) {
      res.status(404).json({
        message: "ERROR: Review Create",
      });
    }

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// NOT NEEDED -> leak
// exports.getReviews = async (req, res) => {
//   try {
//     const review = await Review.find();

//     if (!review) {
//       res.status(404).json({
//         message: "review not found",
//       });
//     }
//     res.json(review);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// };

exports.getReviewsByPg = async (req, res) => {
  try {
    const { star, user, pg } = req.query;

    let baseFilter = {};

    if (star) {
      baseFilter.star = Number(star);
    }

    if (pg) {
      baseFilter.pg = pg;
    }

    let query = Review.find(baseFilter)
      .populate({
        path: "user",
        match: user ? { name: { $regex: user, $options: "i" } } : {},
        select: "name",
      })
      .populate({
        path: "pg",
        select: "name price city address gender",
      });
    const reviews = await query; //dont return whole object,
    // but populate(similar to filter) - return only named fields
    const filtered = reviews.filter((r) => r.user != null && r.pg != null);

    res.json(filtered);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.updateReview = async (req, res) => {
  try {
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not allowed",
      });
    }
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!review) {
      res.status(404).json({
        message: "Review Not found",
      });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json(error);
  }
};
