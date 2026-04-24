// frontend/lib/api/roomType.js
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

export const roomTypeApi = {
  // Get all room types for a specific PG
  getByPgId: async (pgId) => {
    const res = await fetch(`${API_URL}/api/roomtype?pgId=${pgId}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  },

  // Create a new room type
  create: async (data, token) => {
    return authFetch(`${API_URL}/api/roomtype`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  // Update a room type
  update: async (id, data, token) => {
    return authFetch(`${API_URL}/api/roomtype/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  // Delete a room type
  delete: async (id, token) => {
    return authFetch(`${API_URL}/api/roomtype/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
