import React from "react";
import HospitalMap from "./HospitalMap";

function UserDashboard() {
  return (
    <div
      style={{
        maxWidth: "1320px",
        margin: "0 auto",
        padding: "2rem 1.5rem 4rem",
        minHeight: "calc(100vh - 120px)",
      }}
    >
      {/* Top Banner / Healthcare Header */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.25rem",
          marginBottom: "2rem",
          padding: "1.5rem 1.75rem",
          background: "var(--surface-bg)",
          borderRadius: "16px",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--card-shadow)",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "var(--primary-color)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "0.35rem",
            }}
          >
            <span>Live Healthcare Discovery</span>
            <span>•</span>
            <span>Automated Ingestion Active</span>
          </div>

          <h1
            style={{
              margin: "0 0 0.4rem",
              fontSize: "1.85rem",
              fontWeight: 800,
              color: "var(--heading-color)",
              letterSpacing: "-0.02em",
            }}
          >
            Hospital & Emergency Resource Locator
          </h1>

          <p
            style={{
              margin: 0,
              color: "var(--text-secondary)",
              fontSize: "0.95rem",
              maxWidth: "650px",
            }}
          >
            Explore nearby hospitals, medical centers, and clinics with real-time bed,
            oxygen, and ambulance availability verified by the National Government Hospital Directory.
          </p>
        </div>

        {/* Quick Help Badges */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              padding: "0.6rem 1rem",
              background: "var(--bg-muted)",
              borderRadius: "10px",
              border: "1px solid var(--border-color)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Emergency Helpline</span>
            <strong style={{ fontSize: "1.05rem", color: "var(--error-color)" }}>📞 108 / 112</strong>
          </div>

          <div
            style={{
              padding: "0.6rem 1rem",
              background: "var(--bg-muted)",
              borderRadius: "10px",
              border: "1px solid var(--border-color)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Data Feeds</span>
            <strong style={{ fontSize: "1.05rem", color: "var(--primary-color)" }}>OSM + Gov Directory</strong>
          </div>
        </div>
      </div>

      {/* Discovery Map & Directory Component */}
      <HospitalMap />
    </div>
  );
}

export default UserDashboard;