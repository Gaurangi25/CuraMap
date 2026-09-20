import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./MyHospitals.css";

function MyHospitals() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiBase = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    async function fetchHospitals() {
      try {
        const res = await axios.get(`${apiBase}/api/hospitals/mine`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setHospitals(Array.isArray(res.data) ? res.data : [res.data]);
      } catch (err) {
        console.error("Error fetching hospitals:", err);
      } finally {
        setLoading(false);
      }
    }

    if (token) fetchHospitals();
    else setLoading(false);
  }, [token, apiBase]);

  // Delete hospital confirmation
  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this hospital entry? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${apiBase}/api/hospitals/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setHospitals((prev) => prev.filter((h) => h._id !== id));
      alert("Hospital entry deleted successfully.");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Could not delete hospital entry. Please try again.");
    }
  }

  return (
    <div className="my-hospitals-wrapper">
      {/* Header Banner */}
      <div className="my-hospitals-header">
        <div>
          <h1 className="my-hospitals-title">My Managed Facilities</h1>
          <p className="my-hospitals-subtitle">
            Administrator account: <strong>{user?.name || user?.email}</strong>
          </p>
        </div>

        <div className="my-hospitals-nav-actions">
          <button
            type="button"
            onClick={() => navigate("/hospital-admin")}
            className="nav-action-btn primary"
          >
            📊 Resource Dashboard
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="nav-action-btn"
          >
            🧭 User Portal
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-secondary)" }}>
          <p>Loading your facility entries...</p>
        </div>
      ) : hospitals.length === 0 ? (
        <div className="empty-facility-card">
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🏥</div>
          <h2 style={{ margin: "0 0 0.5rem", color: "var(--heading-color)" }}>
            No Assigned Hospitals Found
          </h2>
          <p style={{ margin: "0 0 1.5rem", color: "var(--text-secondary)" }}>
            You do not have any hospitals assigned to your account.
          </p>
          <button
            type="button"
            onClick={() => navigate("/hospital-admin-request")}
            className="nav-action-btn primary"
          >
            Submit Hospital Admin Verification →
          </button>
        </div>
      ) : (
        hospitals.map((hospital) => (
          <div key={hospital._id} className="my-facility-card">
            <div className="facility-card-top">
              <div>
                <h2 className="facility-card-name">{hospital.name}</h2>
                <p className="facility-card-address">
                  📍 {hospital.address || "Address unavailable"}
                </p>
                {hospital.type && (
                  <span
                    style={{
                      display: "inline-block",
                      marginTop: "0.4rem",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "var(--primary-color)",
                      textTransform: "capitalize",
                    }}
                  >
                    🏷️ Category: {hospital.type}
                  </span>
                )}
              </div>

              {hospital.verified && (
                <span
                  style={{
                    background: "#ecfdf5",
                    color: "#047857",
                    border: "1px solid #a7f3d0",
                    padding: "4px 10px",
                    borderRadius: "8px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                  }}
                >
                  ✓ Verified Facility
                </span>
              )}
            </div>

            {/* Live Resource Overview Strip */}
            <div className="facility-resources-strip">
              <div className="facility-resource-box">
                <span className="res-box-label">Available Beds</span>
                <span className="res-box-val">
                  {hospital.availability?.availableBeds ?? "—"}
                </span>
              </div>

              <div className="facility-resource-box">
                <span className="res-box-label">ICU Beds</span>
                <span className="res-box-val">
                  {hospital.availability?.icuBeds ?? "—"}
                </span>
              </div>

              <div className="facility-resource-box">
                <span className="res-box-label">Oxygen Units</span>
                <span className="res-box-val">
                  {hospital.availability?.oxygenUnits ?? "—"}
                </span>
              </div>

              <div className="facility-resource-box">
                <span className="res-box-label">Ambulances</span>
                <span className="res-box-val">
                  {hospital.availability?.ambulances ?? "—"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="facility-card-actions">
              <button
                type="button"
                className="btn-facility-edit"
                onClick={() => navigate(`/edit-hospital/${hospital._id}`)}
              >
                ✏️ Edit Facility Details
              </button>

              <button
                type="button"
                className="btn-facility-delete"
                onClick={() => handleDelete(hospital._id)}
              >
                🗑️ Remove Entry
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default MyHospitals;
