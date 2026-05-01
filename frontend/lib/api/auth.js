// frontend/lib/api/auth.js
const API_URL = require("./apiUrl");

export const authApi = {
  // Login (Verified: /api/auth/login)
  //*Named Export + Object as Namespace
  login: async (credentials) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Login failed (${res.status})`);
      }
      return data;
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === "AbortError") {
        throw new Error(
          "Connection timed out. Check if the backend server is running.",
        );
      }
      throw err;
    }
  },

  // 1. Forgot Password — Request OTP
  forgotPassword: async (email) => {
    // 1. THE EMERGENCY BRAKE (AbortController)
    const controller = new AbortController();

    // 2. THE TIMER (Timeout)
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      // 3. THE NETWORK REQUEST
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        signal: controller.signal, // Connecting the brake to the request
      });

      // 4. STOP THE TIMER
      clearTimeout(timeout);

      // 5. PARSE THE DATA
      const data = await res.json();

      // 6. CHECK FOR SERVER-SIDE ERRORS (400, 500, etc.)
      if (!res.ok) throw new Error(data.message || "Failed to send OTP.");

      return data;
    } catch (err) {
      // 7. CLEANUP & ERROR HANDLING
      clearTimeout(timeout);
      if (err.name === "AbortError") {
        throw new Error(
          "Connection timed out. Check if the backend server is running.",
        );
      }
      throw err;
    }
  },

  // 2. Verify OTP — Get Reset Token
  verifyOtp: async (email, otp) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // WE SEND BOTH: Who is it? (email) + What is the code? (otp)
        body: JSON.stringify({ email, otp }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid OTP.");
      return data; //THIS DATA CONTAINS THE "resetToken"
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  },

  // 3. Reset Password — Set New Password
  resetPassword: async (resetToken, newPassword) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // WE SEND: The "Proof" (resetToken) + The "Target" (newPassword)
        body: JSON.stringify({ resetToken, newPassword }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password.");
      return data;
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === "AbortError") {
        throw new Error(
          "Connection timed out. Check if the backend server is running.",
        );
      }
      throw err;
    }
  },
};
