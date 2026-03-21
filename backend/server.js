const express = require("express");
const cors = require("cors");
const connectDB = require("./db/db.js");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "PG Finder API" });
});

app.use("/api/user", require("./routes/userRoutes.js"));
app.use("/api/pg", require("./routes/pgRoutes.js"));
app.use("/api/booking", require("./routes/bookingRoutes.js"));
app.use("/api/review", require("./routes/reviewRoutes.js"));
app.use("/api/image", require("./routes/imageRoutes.js"));
app.use("/api/auth", require("./routes/authRoutes.js"));
app.use("/api/roomtype", require("./routes/roomType.js"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong" });
});
