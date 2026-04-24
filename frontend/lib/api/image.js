// frontend/lib/api/image.js
const API_URL = require("./apiUrl");

// Shared helper: makes authenticated fetch with timeout + error handling
async function authFetch(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15s for uploads
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
