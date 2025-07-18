// components/Logout.jsx

import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(); // clear auth state
      console.log("Logout Successful");
      alert("Logout successful!");
      // setTimeout(() => {
      //   navigate("/");
      // }, 200);
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Something went wrong during logout.");
    }
  };

  return (
    <button onClick={handleLogout} className="logout-btn">
      🚪 Logout
    </button>
  );
}

export default Logout;
