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
    <div className="landing-wrapper">
      <div className="glow-orbit">
        <div className="landing-page">
          <h2 className="landing-heading">Welcome to CuraMap</h2>
          <p className="landing-para">Select how you want to continue:</p>

          <div className="landing-buttons">
            <button onClick={handleUserClick} className="landing-btn">
              Enter as User
            </button>
            <button onClick={handleAdminClick} className="landing-btn">
              Enter as Hospital Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
