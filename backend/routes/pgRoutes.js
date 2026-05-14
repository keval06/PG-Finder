const express = require("express");
const router = express.Router();
const { protect, optionalProtect } = require("../middleware/protect.js");
const { nearbyLimiter } = require("../middleware/rateLimiter.js");

const {
  registerPG,
  getAllPg,
  getPg,
  updatePg,
  getMyPgs,
  getNearbyPGs,
  getMapPGs,
  getLandingData,
  getSuggestions
} = require("../controllers/pg.js");


router.post("/", protect, registerPG);
router.get("/", getAllPg);                                     //Public — home page listing
router.get("/owner",    protect, getMyPgs);                   // ← owner's own PGs (incl. inactive)
router.get("/suggestions", getSuggestions);                 // ← Search bar city aggregation
router.get("/nearby",nearbyLimiter, getNearbyPGs);          // ← MUST be before /:id
router.get("/map", getMapPGs);                            // Public — lightweight map pins
router.get("/landing", getLandingData);                   //Public — landing page stats
// Static routes must be registered before dynamic routes
router.get("/:id", optionalProtect, getPg);
router.patch("/:id", protect, updatePg);

module.exports = router;
