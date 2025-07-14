import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Public User -> goes to hospital list dorectly
  function handleUserClick() {
    navigate("/user");
  }

  // Hospital admin → requires login
  function handleAdminClick() {
    if (token) {
      navigate("/admin"); //already logged in
    } else {
      navigate("/login"); //not logged in → redirect to login
    }
  }

  return (
    <div className="role-selector">
      <h2>Welcome to CuraMap</h2>
      <p>Select how you want to continue:</p>

      <div className="role-buttons">
        <button onClick={handleUserClick} className="role-btn">
          👤 Enter as User
        </button>
        <button onClick={handleAdminClick} className="role-btn">
          🏥 Enter as Hospital Admin
        </button>
      </div>
    </div>
  );
}

export default LandingPage;
