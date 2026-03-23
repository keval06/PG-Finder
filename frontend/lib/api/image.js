// frontend/lib/api/image.js
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const imageApi = {
  // Get all images for a PG
  getByPgId: async (pgId) => {
    const res = await fetch(`${API_URL}/api/image?pgId=${pgId}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  },

  // Upload a new image
  upload: async (formData, token) => {
    const res = await fetch(`${API_URL}/api/image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }, // Note: No Content-Type for FormData
      body: formData,
    });
    return res.json();
  },

  // Delete an image
  delete: async (id, token) => {
    const res = await fetch(`${API_URL}/api/image/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};
