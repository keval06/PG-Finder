// frontend/lib/api/apiUrl.js
//
// SSR (Server Components): always use localhost (fast loopback, no firewall)
// Client (Browser): auto-derive from window.location.hostname
//   → Laptop at localhost:3000     → API = http://localhost:5000  ✅
//   → Phone at 192.168.1.48:3000   → API = http://192.168.1.48:5000  ✅
//
// No NEXT_PUBLIC_API_URL env var needed for development.

const API_URL =
  typeof window === "undefined"
    ? "http://localhost:5000"
    : `${window.location.protocol}//${window.location.hostname}:5000`;

module.exports = API_URL;
