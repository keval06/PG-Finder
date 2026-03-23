// frontend/lib/api/roomType.js
const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
    const res = await fetch(`${API_URL}/api/roomtype`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Update a room type
  update: async (id, data, token) => {
    const res = await fetch(`${API_URL}/api/roomtype/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Delete a room type
  delete: async (id, token) => {
    const res = await fetch(`${API_URL}/api/roomtype/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};
