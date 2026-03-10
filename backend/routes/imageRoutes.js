  const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect");

const {
  registerImage,
  deleteImage,
  getImagesByPg,
} = require("../controllers/image.js");

router.post("/", registerImage);
router.get("/", getImagesByPg);
router.delete("/:id", deleteImage);
// router.post("login", loginUser);

module.exports = router;
