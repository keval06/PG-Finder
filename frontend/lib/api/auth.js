// frontend/lib/api/auth.js
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const authApi = {
  // Login (Verified: /api/auth/login)
  //*Named Export + Object as Namespace
  login: async (credentials) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return res.json();
  },
};
