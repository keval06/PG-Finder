// frontend/lib/api/image.js
import { authFetch } from "./authFetch";

const API_URL = require("./apiUrl");

export const imageApi = {
  // Get all images for a PG
  getByPgId: async (pgId) => {
    const res = await fetch(`${API_URL}/api/image?pgId=${pgId}`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    return res.json();
  },

  // Upload a new image
  upload: async (formData, token) => {
    return authFetch(`${API_URL}/api/image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }, // Note: No Content-Type for FormData
      body: formData,
    });
  },

  // Delete an image
  delete: async (id, token) => {
    return authFetch(`${API_URL}/api/image/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
