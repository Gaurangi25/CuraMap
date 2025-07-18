// components/Logout.jsx

import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout(); // clears localStorage + user state
    setTimeout(() => navigate("/"), 200);
  };

  return (
    <button onClick={handleLogout} className="logout-btn">
      🚪 Logout
    </button>
  );
}

export default Logout;
