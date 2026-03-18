const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect");

const {
  createRoomType,
  getRoomTypesByPg,
  updateRoomType,
  deleteRoomType,
} = require("../controllers/roomType.js");

router.post("/",      protect, createRoomType);
router.get("/",                getRoomTypesByPg);
router.patch("/:id",  protect, updateRoomType);
router.delete("/:id", protect, deleteRoomType);

module.exports = router;