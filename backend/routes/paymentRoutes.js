const express = require("express");
const router = express.Router();
const { createOrder, verifyPayment, handleWebhook } = require("../controllers/payment.js");
const { protect } = require("../middleware/protect.js"); // Ensure user is logged in

router.post("/create-order", protect, createOrder);
router.post("/verify-payment", protect, verifyPayment);
router.post("/webhook", handleWebhook);  // NO protect — Razorpay calls this, not the user

module.exports = router;
