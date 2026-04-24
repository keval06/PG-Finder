"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

// Decode JWT payload and check if expired (no library needed)
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // exp is in seconds, Date.now() is in milliseconds
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // malformed token → treat as expired
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false); // ← KEY: false until localStorage read

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (stored && stored !== "undefined") {
        //*JSON.parse("undefined") → throws an error 💥
        // *This guard prevents that crash

        // Check if token is still valid before trusting it
        if (token && !isTokenExpired(token)) {
          setUser(JSON.parse(stored));
        } else {
          // Token expired or missing — force clean logout
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      }
    } 
    catch {
      setUser(null);
    } 
    finally {
      setReady(true); // always mark ready after attempt — success or fail
    }
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData };
    localStorage.setItem("user", JSON.stringify(merged));
    setUser(merged);
  };

  // Returns a valid token or null (auto-logs out if expired)
  const getToken = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token || isTokenExpired(token)) {
      logout();
      return null;
    }
    return token;
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, updateUser, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

// ?-custom hook -> export const useAuth = () => useContext(AuthContext);
export function useAuth() {
  return useContext(AuthContext);
}

