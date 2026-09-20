import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

function HospitalAdminDashboard() {
  const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const [form, setForm] = useState({
    availableBeds: "",
    icuBeds: "",
    oxygenUnits: "",
    ventilators: "",
    ambulances: "",
    emergencyStatus: "Available",
  });

  const token = localStorage.getItem("token");

  // Fetch administrator's assigned hospital
  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const response = await axios.get(`${API}/api/hospitals/mine`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;
        setHospital(data);

        setForm({
          availableBeds: data.availability?.availableBeds ?? "",
          icuBeds: data.availability?.icuBeds ?? "",
          oxygenUnits: data.availability?.oxygenUnits ?? "",
          ventilators: data.availability?.ventilators ?? "",
          ambulances: data.availability?.ambulances ?? "",
          emergencyStatus: data.availability?.emergencyStatus || "Available",
        });
      } catch (err) {
        console.error("Error fetching hospital:", err);
        setFeedback({
          type: "error",
          message:
            err.response?.data?.error ||
            "Could not load your assigned hospital profile.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHospital();
  }, [API, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hospital) return;

    setSaving(true);
    setFeedback({ type: "", message: "" });

    try {
      const response = await axios.patch(
        `${API}/api/hospitals/${hospital._id}/availability`,
        {
          availableBeds:
            form.availableBeds === "" ? null : Number(form.availableBeds),
          icuBeds: form.icuBeds === "" ? null : Number(form.icuBeds),
          oxygenUnits:
            form.oxygenUnits === "" ? null : Number(form.oxygenUnits),
          ventilators:
            form.ventilators === "" ? null : Number(form.ventilators),
          ambulances:
            form.ambulances === "" ? null : Number(form.ambulances),
          emergencyStatus: form.emergencyStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHospital(response.data.hospital);
      setFeedback({
        type: "success",
        message: "Hospital availability metrics updated successfully!",
      });

      // Clear success banner after 4 seconds
      setTimeout(() => {
        setFeedback({ type: "", message: "" });
      }, 4000);
    } catch (err) {
      console.error("Error updating availability:", err);
      setFeedback({
        type: "error",
        message:
          err.response?.data?.error ||
          "Could not update hospital availability.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page-container">
        <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--text-secondary)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
          <h2>Loading Hospital Administrator Portal...</h2>
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="dashboard-page-container">
        <div className="admin-facility-card">
          <div className="facility-main-info">
            <h2 className="facility-name">No Hospital Assigned</h2>
            <p className="facility-meta-row">
              Your account does not currently have an assigned hospital facility.
              If you represent a hospital, submit a verification request.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const lastUpdated = hospital.availability?.lastUpdated;

  return (
    <div className="dashboard-page-container">
      {/* Top Facility Card */}
      <div className="admin-facility-card">
        <div className="facility-main-info">
          <div className="facility-eyebrow">
            <span>Verified Facility Administration</span>
            <span>•</span>
            <span>ID: {hospital._id}</span>
          </div>

          <h1 className="facility-name">{hospital.name}</h1>

          <div className="facility-meta-row">
            <span className="facility-meta-item">
              📍 <strong>{hospital.address || "Address unavailable"}</strong>
            </span>
            {hospital.phone && (
              <span className="facility-meta-item">
                📞 <strong>{hospital.phone}</strong>
              </span>
            )}
            {hospital.type && (
              <span className="facility-meta-item">
                🏷️ Type: <strong>{hospital.type}</strong>
              </span>
            )}
            {hospital.totalBeds && (
              <span className="facility-meta-item">
                🏥 Total Capacity: <strong>{hospital.totalBeds} beds</strong>
              </span>
            )}
          </div>
        </div>

        <div className="facility-status-box">
          <span
            className={`emergency-tag ${
              (hospital.availability?.emergencyStatus || "Available").toLowerCase()
            }`}
          >
            ● Emergency Status: {hospital.availability?.emergencyStatus || "Available"}
          </span>

          <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
            🕒 Last Updated:{" "}
            <strong>
              {lastUpdated
                ? new Date(lastUpdated).toLocaleString()
                : "Awaiting first log"}
            </strong>
          </span>
        </div>
      </div>

      {/* Live Resource Stat Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="stat-icon-wrapper">🛏️</span>
          <span className="stat-metric-label">Available Beds</span>
          <span className="stat-metric-number">
            {hospital.availability?.availableBeds ?? "—"}
          </span>
        </div>

        <div className="admin-stat-card">
          <span className="stat-icon-wrapper">🏥</span>
          <span className="stat-metric-label">ICU Beds</span>
          <span className="stat-metric-number">
            {hospital.availability?.icuBeds ?? "—"}
          </span>
        </div>

        <div className="admin-stat-card">
          <span className="stat-icon-wrapper">💨</span>
          <span className="stat-metric-label">Oxygen Units</span>
          <span className="stat-metric-number">
            {hospital.availability?.oxygenUnits ?? "—"}
          </span>
        </div>

        <div className="admin-stat-card">
          <span className="stat-icon-wrapper">🫁</span>
          <span className="stat-metric-label">Ventilators</span>
          <span className="stat-metric-number">
            {hospital.availability?.ventilators ?? "—"}
          </span>
        </div>

        <div className="admin-stat-card">
          <span className="stat-icon-wrapper">🚑</span>
          <span className="stat-metric-label">Ambulances</span>
          <span className="stat-metric-number">
            {hospital.availability?.ambulances ?? "—"}
          </span>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback.message && (
        <div
          style={{
            padding: "1rem 1.25rem",
            borderRadius: "12px",
            fontSize: "0.95rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: feedback.type === "success" ? "#ecfdf5" : "#fef2f2",
            color: feedback.type === "success" ? "#065f46" : "#b91c1c",
            border: `1px solid ${feedback.type === "success" ? "#a7f3d0" : "#fecaca"}`,
          }}
        >
          <span>{feedback.type === "success" ? "✅" : "⚠️"}</span>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Update Availability Form Card */}
      <div className="admin-form-card">
        <div className="admin-form-header">
          <h2 className="admin-form-title">Update Real-Time Availability</h2>
          <p className="admin-form-desc">
            Provide the latest resource counts. These values are reflected immediately on the public discovery map.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <div className="admin-form-field">
              <label htmlFor="availableBeds">Available General Beds</label>
              <input
                id="availableBeds"
                type="number"
                min="0"
                name="availableBeds"
                value={form.availableBeds}
                onChange={handleChange}
                placeholder="e.g. 24"
                className="admin-input"
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="icuBeds">Available ICU Beds</label>
              <input
                id="icuBeds"
                type="number"
                min="0"
                name="icuBeds"
                value={form.icuBeds}
                onChange={handleChange}
                placeholder="e.g. 5"
                className="admin-input"
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="oxygenUnits">Available Oxygen Units</label>
              <input
                id="oxygenUnits"
                type="number"
                min="0"
                name="oxygenUnits"
                value={form.oxygenUnits}
                onChange={handleChange}
                placeholder="e.g. 40"
                className="admin-input"
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="ventilators">Available Ventilators</label>
              <input
                id="ventilators"
                type="number"
                min="0"
                name="ventilators"
                value={form.ventilators}
                onChange={handleChange}
                placeholder="e.g. 8"
                className="admin-input"
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="ambulances">Ambulances on Standby</label>
              <input
                id="ambulances"
                type="number"
                min="0"
                name="ambulances"
                value={form.ambulances}
                onChange={handleChange}
                placeholder="e.g. 3"
                className="admin-input"
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="emergencyStatus">Emergency Intake Status</label>
              <select
                id="emergencyStatus"
                name="emergencyStatus"
                value={form.emergencyStatus}
                onChange={handleChange}
                className="admin-select"
              >
                <option value="Available">Available (Accepting all emergencies)</option>
                <option value="Limited">Limited (Critical cases only / Near capacity)</option>
                <option value="Unavailable">Unavailable (Intake temporarily paused)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="admin-save-btn"
          >
            {saving ? "Saving Updates..." : "Save Availability Metrics →"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default HospitalAdminDashboard;