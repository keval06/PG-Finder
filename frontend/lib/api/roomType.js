// frontend/lib/api/roomType.js
import { authFetch } from "./authFetch";

const API_URL = require("./apiUrl");

export const roomTypeApi = {
  // Get all room types for a specific PG
  getByPgId: async (pgId, token) => {
    return authFetch(`${API_URL}/api/roomtype?pgId=${pgId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    });
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
