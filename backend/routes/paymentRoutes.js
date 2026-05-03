const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect.js"); // Ensure user is logged in
const { createOrder, verifyPayment, handleWebhook } = require("../controllers/payment.js");

router.post("/create-order", protect, createOrder);
router.post("/verify-payment", protect, verifyPayment);
router.post("/webhook", handleWebhook);  // NO protect — Razorpay calls this, not the user

module.exports = router;
