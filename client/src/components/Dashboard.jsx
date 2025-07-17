import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-glow">
        <div className="dashboard-container">
          <p className="dashboard-user">
            Logged in as : <strong>{user?.name || "User"}</strong>
          </p>

          <div className="dashboard-actions">
            <button
              className="dashboard-btn"
              onClick={() => navigate("/admin")}
            >
              Add Hospital
            </button>

            <button
              className="dashboard-btn"
              onClick={() => navigate("/my-hospitals")}
            >
              View My Hospitals
            </button>

            <button className="dashboard-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
