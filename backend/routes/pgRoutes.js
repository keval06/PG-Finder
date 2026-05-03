const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect.js");
const { nearbyLimiter } = require("../middleware/rateLimiter.js");

const {
  registerPG,
  getAllPg,
  getPg,
  updatePg,
  getMyPgs,
  getNearbyPGs,
  getMapPGs,
  getLandingData
} = require("../controllers/pg.js");

router.post("/", protect, registerPG);
router.get("/", getAllPg);
router.get("/owner",    protect, getMyPgs);   // ← owner's own PGs (incl. inactive)
router.get("/nearby",nearbyLimiter, getNearbyPGs);          // ← MUST be before /:id
router.get("/map", getMapPGs);          // ← ADD HERE
router.get("/landing", getLandingData);
router.get("/:id", getPg);
router.patch("/:id", protect, updatePg);
// router.get("/owner", protect, getMyPgs); // ← owner's own PGs (incl. inactive)

// router.post("login", loginUser);

module.exports = router;
