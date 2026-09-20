import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function HospitalAdminRequest() {
  const [hospitals, setHospitals] = useState([]);
  const [hospitalId, setHospitalId] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [designation, setDesignation] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingHospitals, setFetchingHospitals] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  // Fetch verified hospitals for the dropdown
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await axios.get(`${API}/api/hospitals`);
        setHospitals(response.data);
      } catch (err) {
        console.error("Error fetching hospitals:", err);
        setError("Unable to load hospitals directory. Please check network connection.");
      } finally {
        setFetchingHospitals(false);
      }
    };

    fetchHospitals();
  }, [API]);

  // Submit administrator verification request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!hospitalId || !officialEmail || !designation) {
      setError("Please fill out all required fields.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.post(
        `${API}/api/hospital-admin/request`,
        {
          hospitalId,
          officialEmail: officialEmail.trim(),
          designation: designation.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(
        "Verification request submitted successfully. A Super Administrator will review your credentials."
      );

      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (err) {
      console.error("Hospital Admin request error:", err);
      setError(
        err.response?.data?.error ||
          "Failed to submit verification request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page-container">
      <div style={{ maxWidth: "700px", margin: "0 auto", width: "100%" }}>
        {/* Form Container */}
        <div className="admin-form-card">
          <div className="admin-form-header">
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
                marginBottom: "0.3rem",
              }}
            >
              <span>Hospital Verification</span>
              <span>•</span>
              <span>Credential Review</span>
            </div>

            <h1 className="admin-form-title">Request Hospital Admin Access</h1>

            <p className="admin-form-desc">
              To update emergency availability metrics and bed counts, submit your official facility
              credentials for verification.
            </p>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div
              style={{
                padding: "0.85rem 1rem",
                background: "#fef2f2",
                color: "#b91c1c",
                border: "1px solid #fecaca",
                borderRadius: "10px",
                fontSize: "0.9rem",
                fontWeight: 600,
                marginBottom: "1.25rem",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div
              style={{
                padding: "0.85rem 1rem",
                background: "#ecfdf5",
                color: "#065f46",
                border: "1px solid #a7f3d0",
                borderRadius: "10px",
                fontSize: "0.9rem",
                fontWeight: 600,
                marginBottom: "1.25rem",
              }}
            >
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Hospital Selector */}
            <div className="admin-form-field">
              <label htmlFor="select-hospital">
                Select Your Hospital Facility *
              </label>
              <select
                id="select-hospital"
                value={hospitalId}
                onChange={(e) => setHospitalId(e.target.value)}
                disabled={fetchingHospitals}
                className="admin-select"
                required
              >
                <option value="">
                  {fetchingHospitals
                    ? "Loading hospital database..."
                    : "— Choose a hospital from the directory —"}
                </option>
                {hospitals.map((hospital) => (
                  <option key={hospital._id} value={hospital._id}>
                    {hospital.name} {hospital.address ? `(${hospital.address})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Official Email */}
            <div className="admin-form-field">
              <label htmlFor="official-email">
                Official Institutional Email Address *
              </label>
              <input
                id="official-email"
                type="email"
                value={officialEmail}
                onChange={(e) => setOfficialEmail(e.target.value)}
                placeholder="administrator@hospital-network.org"
                className="admin-input"
                required
              />
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                Must be an official hospital domain email for institutional verification.
              </span>
            </div>

            {/* Designation */}
            <div className="admin-form-field">
              <label htmlFor="official-designation">
                Your Job Title / Designation *
              </label>
              <input
                id="official-designation"
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Chief Medical Officer, Resource Coordinator, Operations Lead"
                className="admin-input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || fetchingHospitals}
              className="admin-save-btn"
              style={{ width: "100%", marginTop: "0.5rem" }}
            >
              {loading ? "Submitting Application..." : "Submit Verification Request →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default HospitalAdminRequest;