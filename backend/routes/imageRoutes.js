const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect");

const {
  registerImage,
  deleteImage,
  getImagesByPg,
} = require("../controllers/image.js");
const upload = require("../middleware/upload.js");

router.post("/", protect, (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      });
    }
    next();
  });
}, registerImage);

router.get("/", getImagesByPg);
router.delete("/:id", protect, deleteImage);

module.exports = router;
