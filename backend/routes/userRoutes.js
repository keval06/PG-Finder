const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect");


const {
  registerUser,
  getUser,
  updateUser,
} = require("../controllers/user.js");

router.post("/signup", registerUser);
router.get("/", getUser);
router.patch("/:id",  updateUser);
// router.post("login", loginUser);

module.exports = router;
