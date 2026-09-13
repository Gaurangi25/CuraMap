import React from "react";
import HospitalMap from "./HospitalMap";

function UserDashboard() {
  return (
    <div
      style={{
        padding: "30px",
        backgroundColor: "#f5f6fb",
        minHeight: "calc(100vh - 300px)",
      }}
    >
      <h1
        style={{
          color: "#111827",
          marginBottom: "10px",
        }}
      >
        Welcome to CuraMap
      </h1>

      <p
        style={{
          color: "#374151",
          fontSize: "17px",
          marginBottom: "25px",
        }}
      >
        Find nearby hospitals, check hospital details, and get directions.
      </p>

      <div
        style={{
          backgroundColor: "white",
          borderRadius: "14px",
          padding: "20px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <HospitalMap />
      </div>
    </div>
  );
}

export default UserDashboard;