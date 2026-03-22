// frontend/lib/api/pg.js
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const pgApi = {
  // Home Page Listings
  getAll: async () => {
    const res = await fetch(`${API_URL}/api/pg`, { cache: "no-store" });
    return res.json();
  },

  // Owner's Dashboard Listings (Verified: /api/pg/owner)
  getOwnerPgs: async (token) => {
    const res = await fetch(`${API_URL}/api/pg/owner`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return res.json();
  },

  // PG Details (Verified: /api/pg/:id)
  getById: async (id) => {
    const res = await fetch(`${API_URL}/api/pg/${id}`, { cache: "no-store" });
    return res.json();
  },

  // Create & Update
  create: async (data, token) => {
    const res = await fetch(`${API_URL}/api/pg`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  update: async (id, data, token) => {
    const res = await fetch(`${API_URL}/api/pg/${id}`, {
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
