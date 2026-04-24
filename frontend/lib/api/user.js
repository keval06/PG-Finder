// frontend/lib/api/user.js
const API_URL = require("./apiUrl");

// Shared helper: makes authenticated fetch with timeout + error handling
async function authFetch(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeout);
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.message || `Request failed (${res.status})`);
      err.status = res.status;
      throw err;
    }
    return data;
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      throw new Error("Request timed out. Check your connection.");
    }
    throw err;
  }
}

export const userApi = {
  // Signup (Verified: /api/user/signup)
  signup: async (data) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(`${API_URL}/api/user/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || `Signup failed (${res.status})`);
      }
      return result;
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === "AbortError") {
        throw new Error("Connection timed out. Check if the backend server is running.");
      }
      throw err;
    }
  },

  // Update Profile (Verified: /api/user/:id)
  update: async (id, data, token) => {
    return authFetch(`${API_URL}/api/user/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },
};
