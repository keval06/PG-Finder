// frontend/lib/api/booking.js
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

export const bookingApi = {
  // Guest History (Verified: /api/booking/my)
  getUserBookings: async (token, queryString = "") => {
    const url = queryString 
      ? `${API_URL}/api/booking/my?${queryString}` 
      : `${API_URL}/api/booking/my`;
    return authFetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  },

  // Owner Dashboard (Verified: /api/booking/received)
  getOwnerBookings: async (token, queryString = "") => {
    const url = queryString 
      ? `${API_URL}/api/booking/received?${queryString}` 
      : `${API_URL}/api/booking/received`;
    return authFetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  },

  // Update Status (Confirm/Cancel)
  updateStatus: async (id, status, token) => {
    return authFetch(`${API_URL}/api/booking/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
  },

  create: async (data, token) => {
    return authFetch(`${API_URL}/api/booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },
};
