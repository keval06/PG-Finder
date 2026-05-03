import { authFetch } from "./authFetch";

// frontend/lib/api/user.js
const API_URL = require("./apiUrl");

export const userApi = {
  // Signup (Verified: /api/user/signup)
  signup: async (data) => {
    return authFetch(`${API_URL}/api/user/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  // Update Profile (Verified: /api/user/:id)
  update: async (id, data, token) => {
    return authFetch(`${API_URL}/api/user/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },
};
