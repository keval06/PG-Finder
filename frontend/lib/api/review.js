// frontend/lib/api/review.js
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const reviewApi = {
  // ── READ  used in page.js (server-side) to calculate AVERAGE RATING
  //
  getByPgId: async (pgId) => {
    const res = await fetch(`${API_URL}/api/review?pg=${pgId}`, {
      next: { revalidate: 900 },
    });
    if (!res.ok) return [];
    return res.json();
  },

  //? ── READ (paginated, used by ReviewsSection) ──
  
  getByPgIdPaginated: async (pgId, page = 1, limit = 5, sort = "newest") => {
    const res = await fetch(
      `${API_URL}/api/review?pg=${pgId}&page=${page}&limit=${limit}&sort=${sort}`,
      { cache: "no-store" }
    );
    if (!res.ok) return { reviews: [], total: 0, page: 1, totalPages: 1 };
    return res.json();
  },

  // ── CHECK — can this user review this PG? ──
  // Returns:
  //*   { canReview: false, reason: "no_booking" }
  // *  { canReview: false, reason: "already_reviewed", review: {...} }
  //  * { canReview: true }
  // ?Business rule: you can only review a PG if you've actually stayed there (made a booking).
  // ?And you can only review once.
  canReview: async (pgId, token) => {
    const res = await fetch(`${API_URL}/api/review/can-review?pg=${pgId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return { canReview: false, reason: "error" };
    return res.json();
  },

  // ── CREATE ──
  submit: async (data, token) => {
    const res = await fetch(`${API_URL}/api/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // ── UPDATE ──
  update: async (id, data, token) => {
    const res = await fetch(`${API_URL}/api/review/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // ── DELETE ──
  delete: async (id, token) => {
    const res = await fetch(`${API_URL}/api/review/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};
