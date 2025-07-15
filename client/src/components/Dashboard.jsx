import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-heading">Welcome to Your Dashboard</h1>
      <p className="dashboard-user">
        Logged in as: <strong>{user?.name || "User"}</strong>
      </p>

      <div className="dashboard-actions">
        <button className="dashboard-btn" onClick={() => navigate("/admin")}>
          ➕ Add Hospital
        </button>

        <button className="dashboard-btn" onClick={() => navigate("/my-hospitals")}>
          📄 View My Hospitals
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
