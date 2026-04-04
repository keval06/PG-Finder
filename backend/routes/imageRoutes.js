const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect");

const {
  registerImage,
  deleteImage,
  getImagesByPg,
} = require("../controllers/image.js");
const upload = require("../middleware/upload.js");

router.post("/", protect, upload.single("image"), registerImage);
router.get("/", getImagesByPg);
router.delete("/:id", protect, deleteImage);

module.exports = router;
