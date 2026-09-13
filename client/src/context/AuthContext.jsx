import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

// Create the context
const AuthContext = createContext();

// Custom hook for accessing auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() =>
    localStorage.getItem("token")
  );

  const [loading, setLoading] = useState(true);

  // Load saved login info from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (savedToken) {
      try {
        const decoded = jwtDecode(savedToken);

        const userFromToken = {
          _id: decoded.id,
          email: decoded.email,
          name: decoded.name,

          // NEW
          role: decoded.role || "user",
          hospitalId: decoded.hospitalId || null,
        };

        setToken(savedToken);
        setUser(userFromToken);

        // console.log("Auth restored from token:", userFromToken);
      } catch (err) {
        console.warn("⚠️ Invalid token in localStorage. Clearing...");
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      }
    }

    setLoading(false);
  }, []);

  // Save login info
  function login(newToken, newUser) {
    setToken(newToken);

    setUser({
      ...newUser,
      role: newUser.role || "user",
      hospitalId: newUser.hospitalId || null,
    });

    localStorage.setItem("token", newToken);
  }

  // Logout function
  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}