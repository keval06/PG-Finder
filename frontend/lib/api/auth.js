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
        throw new Error("Connection timed out. Check if the backend server is running.");
      }
      throw err;
    }
  },
};
