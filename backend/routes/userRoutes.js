const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect");
const { signupLimiter } = require("../middleware/rateLimiter.js");

const { registerUser, getUser, updateUser } = require("../controllers/user.js");

router.post("/signup", signupLimiter, registerUser);
router.get("/", protect, getUser);
router.patch("/:id", updateUser);
// router.post("login", loginUser);

module.exports = router;
