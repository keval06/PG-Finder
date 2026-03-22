// frontend/lib/api/review.js
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const reviewApi = {
    
  // Get reviews for a PG
  getByPgId: async (pgId) => {
    const res = await fetch(`${API_URL}/api/review?pg=${pgId}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  },

  // Add a new review
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

  // Update a review
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
};
