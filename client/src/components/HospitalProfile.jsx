import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./HospitalProfile.css";

function HospitalProfile() {
  const { id } = useParams();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reported, setReported] = useState(false);

  const apiBase = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    axios
      .get(`${apiBase}/api/hospitals/${id}`)
      .then((res) => setHospital(res.data))
      .catch((err) => console.error("Error fetching hospital by ID:", err))
      .finally(() => setLoading(false));
  }, [id, apiBase]);

  const handleReport = () => {
    if (reported) return;
    axios
      .patch(`${apiBase}/api/hospitals/${id}/report`)
      .then((res) => {
        setHospital(res.data);
        setReported(true);
      })
      .catch((err) => console.error("Report failed:", err));
  };

  const handleDirections = () => {
    if (hospital?.latitude && hospital?.longitude) {
      const dest = `${hospital.latitude},${hospital.longitude}`;
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`,
        "_blank"
      );
    }
  };

  if (loading) {
    return (
      <div className="hospital-profile-page">
        <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "3rem" }}>
          Loading hospital medical information...
        </p>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="hospital-profile-page">
        <Link to="/user" className="profile-back-link">
          ← Back to Hospital Directory
        </Link>
        <div className="profile-card-container">
          <h2>Hospital Facility Not Found</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            The requested hospital identifier was not found in the live directory.
          </p>
        </div>
      </div>
    );
  }

  const beds =
    hospital.availability?.availableBeds ??
    hospital.availableBeds ??
    (hospital.totalBeds ? `${hospital.totalBeds} total` : "Unavailable");

  const oxygen =
    hospital.availability?.oxygenUnits ??
    hospital.availableOxygen ??
    "Unavailable";

  const ambulances =
    hospital.availability?.ambulances ??
    hospital.ambulancesAvailable ??
    "Unavailable";

  const lastUpdated =
    hospital.availability?.lastUpdated || hospital.lastUpdated;

  return (
    <div className="hospital-profile-page">
      <Link to="/user" className="profile-back-link">
        ← Back to Healthcare Discovery
      </Link>

      <div className="profile-card-container">
        {/* Header Block */}
        <div className="profile-header-strip">
          <div style={{ flex: 1 }}>
            <h1 className="profile-title">{hospital.name}</h1>
            <p className="profile-address-text">
              📍 {hospital.address || "Address details currently unavailable"}
            </p>

            <div className="profile-badges-row">
              {hospital.type && (
                <span
                  style={{
                    background: "var(--primary-light)",
                    color: "var(--primary-color)",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textTransform: "capitalize",
                  }}
                >
                  {hospital.type}
                </span>
              )}

              {hospital.verified && (
                <span
                  style={{
                    background: "#ecfdf5",
                    color: "#047857",
                    border: "1px solid #a7f3d0",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                  }}
                >
                  ✓ National Directory Verified
                </span>
              )}

              <span
                style={{
                  background: hospital.openNow ? "#ecfdf5" : "#fef2f2",
                  color: hospital.openNow ? "#047857" : "#b91c1c",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                }}
              >
                {hospital.openNow ? "🟢 Open for Service" : "🔴 Status Unconfirmed / Closed"}
              </span>
            </div>
          </div>
        </div>

        {/* Real-Time Resource Availability Grid */}
        <div className="profile-resources-grid">
          <div className="profile-resource-box">
            <span className="profile-res-icon">🛏️</span>
            <span className="profile-res-label">Available Beds</span>
            <span className="profile-res-val">{beds}</span>
          </div>

          <div className="profile-resource-box">
            <span className="profile-res-icon">💨</span>
            <span className="profile-res-label">Oxygen Units</span>
            <span className="profile-res-val">
              {typeof oxygen === "number" ? `${oxygen} units` : oxygen}
            </span>
          </div>

          <div className="profile-resource-box">
            <span className="profile-res-icon">🚑</span>
            <span className="profile-res-label">Ambulances</span>
            <span className="profile-res-val">{ambulances}</span>
          </div>
        </div>

        {/* Detailed Facility Information */}
        <div className="profile-metadata-table">
          {hospital.phone && (
            <div className="profile-meta-row">
              <span className="meta-row-label">Contact Phone</span>
              <span className="meta-row-val">📞 {hospital.phone}</span>
            </div>
          )}

          {hospital.website && (
            <div className="profile-meta-row">
              <span className="meta-row-label">Official Website</span>
              <a
                href={hospital.website}
                target="_blank"
                rel="noopener noreferrer"
                className="meta-row-val"
                style={{ color: "var(--primary-color)", textDecoration: "underline" }}
              >
                🌐 Visit Hospital Portal ↗
              </a>
            </div>
          )}

          {hospital.speciality && (
            <div className="profile-meta-row">
              <span className="meta-row-label">Specialties</span>
              <span className="meta-row-val">🩺 {hospital.speciality}</span>
            </div>
          )}

          {hospital.totalBeds && (
            <div className="profile-meta-row">
              <span className="meta-row-label">Total Bed Capacity</span>
              <span className="meta-row-val">🏥 {hospital.totalBeds} licensed beds</span>
            </div>
          )}

          <div className="profile-meta-row">
            <span className="meta-row-label">Last Availability Sync</span>
            <span className="meta-row-val">
              🕒 {lastUpdated ? new Date(lastUpdated).toLocaleString() : "Real-time feed active"}
            </span>
          </div>

          <div className="profile-meta-row">
            <span className="meta-row-label">Data Source</span>
            <span className="meta-row-val">
              🔍 {hospital.source || "OpenStreetMap + Government Directory"}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="profile-actions-strip">
          <button
            type="button"
            className="btn-directions"
            onClick={handleDirections}
          >
            🧭 Open Navigation in Google Maps
          </button>

          <button
            type="button"
            className="btn-report-issue"
            onClick={handleReport}
            disabled={reported}
          >
            {reported ? "✓ Issue Reported" : `⚠️ Report Data Discrepancy (${hospital.reportCount || 0})`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default HospitalProfile;
