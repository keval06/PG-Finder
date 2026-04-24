// frontend/lib/api/reviews.js
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

export const reviewApi = {
  // ── READ  used in page.js (server-side) to calculate AVERAGE RATING
  //
  getByPgId: async (pgId) => {
    const res = await fetch(`${API_URL}/api/reviews?pg=${pgId}`, {
      next: { revalidate: 900 },
    });
    if (!res.ok) return [];
    return res.json();
  },

  //? ── READ (paginated, used by ReviewsSection) ──
  
  getByPgIdPaginated: async (pgId, page = 1, limit = 5, sort = "newest") => {
    try {
      const url = `${API_URL}/api/reviews?pg=${pgId}&page=${page}&limit=${limit}&sort=${sort}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return { reviews: [], total: 0, page: 1, totalPages: 1 };
      return res.json();
    } catch (err) {
      console.error("Reviews API Fetch Error:", err.message);
      return { reviews: [], total: 0, page: 1, totalPages: 1 };
    }
  },

  // ── CHECK — can this user review this PG? ──
  // Returns:
  //*   { canReview: false, reason: "no_booking" }
  // *  { canReview: false, reason: "already_reviewed", review: {...} }
  //  * { canReview: true }
  // ?Business rule: you can only review a PG if you've actually stayed there (made a booking).
  // ?And you can only review once.
  canReview: async (pgId, token) => {
    try {
      return await authFetch(`${API_URL}/api/reviews/can-review?pg=${pgId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
    } catch {
      return { canReview: false, reason: "error" };
    }
  },

  // ── CREATE ──
  submit: async (data, token) => {
    return authFetch(`${API_URL}/api/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  // ── UPDATE ──
  update: async (id, data, token) => {
    return authFetch(`${API_URL}/api/reviews/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  // ── DELETE ──
  delete: async (id, token) => {
    return authFetch(`${API_URL}/api/reviews/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
