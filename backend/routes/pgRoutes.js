const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect.js");

const {
  registerPG,
  getAllPg,
  getPg,
  updatePg,
} = require("../controllers/pg.js");

router.post("/", registerPG);
router.get("/", getAllPg);
router.get("/:id", getPg);
router.patch("/:id", updatePg);
// router.post("login", loginUser);

module.exports = router;
