import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./AddHospitalForm.css";

function EditHospital() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  // Form state to hold hospital info
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    type: "",
    availableBeds: 0,
    availableOxygen: 0,
    ambulancesAvailable: 0,
  });

  const [loading, setLoading] = useState(true);

  // Fetch the hospital data from backend when component mounts
  useEffect(() => {
    async function fetchHospital() {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/hospitals/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFormData(res.data); // Populate form with existing data
        setLoading(false);
      } catch (err) {
        console.error("Error fetching hospital:", err);
        alert("Could not load hospital data.");
        navigate("/my-hospitals");
      }
    }

    if (token) fetchHospital();
  }, [id, token, navigate]);

  // Handle form input change
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.startsWith("available") ? Number(value) : value,
    }));
  }

  // Submit updated data to backend
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/hospitals/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Hospital updated successfully!");
      navigate("/my-hospitals");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update hospital.");
    }
  }

  // Loading indicator
  if (loading) return <p>Loading hospital data...</p>;

  return (
    <div className="hospital-form">
      <h2 className="form-title">✏️ Edit Hospital</h2>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="form-body">
        <input
          className="form-input"
          type="text"
          placeholder="Hospital Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          className="form-input"
          type="text"
          placeholder="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />

        <select
          className="form-select"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
        >
          <option value="">Select Type</option>
          <option value="general">General</option>
          <option value="specialized">Specialized</option>
          <option value="clinic">Clinic</option>
        </select>

        <input
          className="form-input"
          type="number"
          placeholder="Available Beds"
          name="availableBeds"
          value={formData.availableBeds}
          onChange={handleChange}
          min="0"
        />

        <input
          className="form-input"
          type="number"
          placeholder="Available Oxygen Units"
          name="availableOxygen"
          value={formData.availableOxygen}
          onChange={handleChange}
          min="0"
        />

        <input
          className="form-input"
          type="number"
          placeholder="Ambulances Available"
          name="ambulancesAvailable"
          value={formData.ambulancesAvailable}
          onChange={handleChange}
          min="0"
        />

        {/* Action buttons */}
        <div className="form-navigation">
          <button type="submit" className="form-submit-btn">
            ✅ Save Changes
          </button>
          <button
            type="button"
            className="form-view-button"
            onClick={() => navigate("/my-hospitals")}
          >
            🔙 Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditHospital;
