// frontend/lib/api/user.js
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const userApi = {
  // Signup (Verified: /api/user/signup)
  signup: async (data) => {
    const res = await fetch(`${API_URL}/api/user/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Update Profile (Verified: /api/user/:id)
  update: async (id, data, token) => {
    const res = await fetch(`${API_URL}/api/user/${id}`, {
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
