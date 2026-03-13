"use client";

import { 
  createContext, 
  useContext,
  useState, 
  useEffect 
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null);
  const [ready, setReady] = useState(false); // ← KEY: false until localStorage read

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");

      if (stored && stored !== "undefined") {
        setUser(JSON.parse(stored));
        //JSON.parse("undefined") → throws an error 💥
// This guard prevents that crash
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

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData };
    localStorage.setItem("user", JSON.stringify(merged));
    setUser(merged);
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// export const useAuth = () => useContext(AuthContext);
export function useAuth() {
  return useContext(AuthContext)
}