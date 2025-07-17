// components/Logout.jsx

import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();           // clears localStorage + user state
    navigate("/"); 
  };

  return (
    <button onClick={handleLogout} className="logout-btn">
      🚪 Logout
    </button>
  );
}

export default Logout;
