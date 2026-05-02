// frontend/lib/api/pg.js
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

export const pgApi = {
  // Home Page Listings
  // cache: "no-store" → always hits the backend fresh; prevents stale error
  // responses from being cached and served for 60s after a backend restart.
  getAll: async (queryString = "") => {
    const url = queryString
      ? `${API_URL}/api/pg?${queryString}`
      : `${API_URL}/api/pg`;
    // 🛡️ REPLACED fetch with authFetch
    return authFetch(url, { cache: "no-store" });
  },

  // Radius PGs
  getNearby: async (lat, lng, radius = 5, queryString = "") => {
    const base = `${API_URL}/api/pg/nearby?lat=${lat}&lng=${lng}&radius=${radius}`;
    const url = queryString ? `${base}&${queryString}` : base;
    // 🛡️ REPLACED fetch with authFetch
    return authFetch(url, { cache: "no-store" });
  },

  // Owner's Dashboard Listings (Verified: /api/pg/owner)
  getOwnerPgs: async (token, queryString = "") => {
    const url = queryString
      ? `${API_URL}/api/pg/owner?${queryString}`
      : `${API_URL}/api/pg/owner`;

    return authFetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  },

  // PG Details (Verified: /api/pg/:id)
  getById: async (id) => {
    // 🛡️ REPLACED fetch with authFetch
    return authFetch(`${API_URL}/api/pg/${id}`, { cache: "no-store" });
  },

  // Create & Update
  create: async (data, token) => {
    return authFetch(`${API_URL}/api/pg`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  update: async (id, data, token) => {
    return authFetch(`${API_URL}/api/pg/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },
};
