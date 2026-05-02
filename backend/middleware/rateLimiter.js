const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per windowMs
  message: {
    message:
      "Too many login attempts from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 signup requests per windowMs
  message: {
    message:
      "Too many accounts created from this IP, please try again after an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, signupLimiter };
