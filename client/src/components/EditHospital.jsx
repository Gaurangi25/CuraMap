import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

function EditHospital() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    website: "",
    type: "general",
    totalBeds: "",
    specialities: "",
    facilities: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const apiBase = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  // Fetch hospital data from backend
  useEffect(() => {
    async function fetchHospital() {
      try {
        const res = await axios.get(`${apiBase}/api/hospitals/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = res.data;
        setFormData({
          name: data.name || "",
          address: data.address || "",
          phone: data.phone || "",
          website: data.website || "",
          type: data.type || "general",
          totalBeds: data.totalBeds ?? "",
          specialities: data.specialities || "",
          facilities: data.facilities || "",
        });
      } catch (err) {
        console.error("Error fetching hospital:", err);
        setError("Could not load hospital data.");
      } finally {
        setLoading(false);
      }
    }

    if (token) fetchHospital();
    else setLoading(false);
  }, [id, token, apiBase]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "totalBeds" ? (value === "" ? "" : Number(value)) : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await axios.put(`${apiBase}/api/hospitals/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Hospital profile updated successfully!");
      navigate("/my-hospitals");
    } catch (err) {
      console.error("Update failed:", err);
      setError(
        err.response?.data?.error || "Failed to update hospital profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard-page-container">
        <p style={{ textAlign: "center", color: "var(--text-secondary)" }}>
          Loading hospital profile details...
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-page-container">
      <div style={{ maxWidth: "760px", margin: "0 auto", width: "100%" }}>
        <div className="admin-form-card">
          <div className="admin-form-header">
            <h1 className="admin-form-title">✏️ Edit Hospital Profile</h1>
            <p className="admin-form-desc">
              Update institutional metadata, contact information, and bed capacity.
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: "0.85rem 1rem",
                background: "#fef2f2",
                color: "#b91c1c",
                border: "1px solid #fecaca",
                borderRadius: "10px",
                fontSize: "0.9rem",
                marginBottom: "1.25rem",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="admin-form-field">
              <label htmlFor="edit-name">Hospital Name *</label>
              <input
                id="edit-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="admin-input"
                required
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="edit-address">Full Address *</label>
              <input
                id="edit-address"
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="admin-input"
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="admin-form-field">
                <label htmlFor="edit-phone">Contact Phone Number</label>
                <input
                  id="edit-phone"
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="admin-input"
                  placeholder="+91-11-23456789"
                />
              </div>

              <div className="admin-form-field">
                <label htmlFor="edit-type">Facility Classification *</label>
                <select
                  id="edit-type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="admin-select"
                  required
                >
                  <option value="general">General Hospital</option>
                  <option value="specialized">Specialized Hospital</option>
                  <option value="clinic">Clinic / Health Centre</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="admin-form-field">
                <label htmlFor="edit-website">Official Website URL</label>
                <input
                  id="edit-website"
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="admin-input"
                  placeholder="https://hospital.org"
                />
              </div>

              <div className="admin-form-field">
                <label htmlFor="edit-beds">Total Bed Capacity</label>
                <input
                  id="edit-beds"
                  type="number"
                  min="0"
                  name="totalBeds"
                  value={formData.totalBeds}
                  onChange={handleChange}
                  className="admin-input"
                  placeholder="e.g. 250"
                />
              </div>
            </div>

            <div className="admin-form-field">
              <label htmlFor="edit-specialities">Key Specialties</label>
              <input
                id="edit-specialities"
                type="text"
                name="specialities"
                value={formData.specialities}
                onChange={handleChange}
                className="admin-input"
                placeholder="e.g. Cardiology, Orthopedics, Trauma Center, Neurology"
              />
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button
                type="submit"
                disabled={saving}
                className="admin-save-btn"
                style={{ flex: 1 }}
              >
                {saving ? "Saving Changes..." : "✓ Save Hospital Profile"}
              </button>

              <button
                type="button"
                className="nav-action-btn"
                style={{ padding: "0 1.5rem" }}
                onClick={() => navigate("/my-hospitals")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditHospital;
