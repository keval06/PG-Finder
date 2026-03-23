// frontend/lib/api/booking.js
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const bookingApi = {
  // Guest History (Verified: /api/booking/my)
  getUserBookings: async (token) => {
    const res = await fetch(`${API_URL}/api/booking/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  // Owner Dashboard (Verified: /api/booking/received)
  getOwnerBookings: async (token) => {                                  
    const res = await fetch(`${API_URL}/api/booking/received`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  // Update Status (Confirm/Cancel)
  updateStatus: async (id, status, token) => {
    const res = await fetch(`${API_URL}/api/booking/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  create: async (data, token) => {
    const res = await fetch(`${API_URL}/api/booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
