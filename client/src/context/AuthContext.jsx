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
  const [token, setToken] = useState(() => localStorage.getItem("token"));

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
        };

        setToken(savedToken);
        setUser(userFromToken);

        //console.log("Auth restored from token:", userFromToken);
      } catch (err) {
        console.warn("⚠️ Invalid token in localStorage. Clearing...");
        localStorage.removeItem("token");
      }
    }
  }, []);

  // Save login info
  function login(newToken, newUser) {
    console.log("Saving token to context/localStorage:", newToken);
    console.log("Saving user to context", newUser);

    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
  }

  // Logout function
  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/*

AuthContext.jsx — What It Does:
This file creates a global authentication system using React Context.
It helps the whole app know:

Who is logged in
What their token is
How to log in / log out

🔧 Core Functions Inside:
login(token, user): saves user + token to state and localStorage
logout(): clears user and token from state and storage
useAuth(): lets any component easily access auth data

*/
