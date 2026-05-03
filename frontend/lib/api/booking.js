// frontend/lib/api/booking.js
import { authFetch } from "./authFetch";

const API_URL = require("./apiUrl");

export const bookingApi = {
  // Guest History (Verified: /api/booking/my)
  getUserBookings: async (token, queryString = "") => {
    const url = queryString 
      ? `${API_URL}/api/booking/my?${queryString}` 
      : `${API_URL}/api/booking/my`;
    return authFetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  },

  // Owner Dashboard (Verified: /api/booking/received)
  getOwnerBookings: async (token, queryString = "") => {
    const url = queryString 
      ? `${API_URL}/api/booking/received?${queryString}` 
      : `${API_URL}/api/booking/received`;
    return authFetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  },

  // Update Status (Confirm/Cancel)
  updateStatus: async (id, status, token) => {
    return authFetch(`${API_URL}/api/booking/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
  },

  create: async (data, token) => {
    return authFetch(`${API_URL}/api/booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },
};
