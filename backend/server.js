const express = require("express");
const cors = require("cors");
const connectDB = require("./db/db.js");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────────────────────
// Must be registered BEFORE app.listen() so every request is processed correctly.
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, SSR)
      if (!origin) return callback(null, true);

      const allowed = [
        process.env.FRONTEND_URL,
        "https://quickpg.in",
        "https://www.quickpg.in",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
      ].filter(Boolean);  
      // Allow any LAN IP (192.168.x.x) for development/mobile testing
      if (allowed.includes(origin) || /^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin)) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use("/api/payment/webhook",
  express.raw({ type :"application/json"}),
  (req,res,next)=>{
    req.body = JSON.parse(req.body);
    next();
  }
);

// Middleware
// Optional: Also limit URL encoded data if used
app.use(express.json({ limit: "10kb" })); 
app.use(express.urlencoded({ limit: "10kb", extended: true }));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "PG Finder API" });
});

app.use("/api/user", require("./routes/userRoutes.js"));
app.use("/api/pg", require("./routes/pgRoutes.js"));
app.use("/api/booking", require("./routes/bookingRoutes.js"));
app.use("/api/reviews", require("./routes/reviewRoutes.js"));
app.use("/api/image", require("./routes/imageRoutes.js"));
app.use("/api/auth", require("./routes/authRoutes.js"));
app.use("/api/roomtype", require("./routes/roomType.js"));
app.use("/api/payment", require("./routes/paymentRoutes.js"));
require("./cron/bookingCleanup.js");

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// ── Start server AFTER all middleware & routes are registered ────────────────
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
