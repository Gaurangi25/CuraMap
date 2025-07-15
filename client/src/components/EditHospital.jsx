// EditHospital.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function EditHospital() {
  const { id } = useParams(); // Get hospital ID from URL
  const navigate = useNavigate();
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    type: "",
    availableBeds: 0,
    availableOxygen: 0,
    ambulancesAvailable: 0,
  });

  const [loading, setLoading] = useState(true);

  // Fetch existing hospital data
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
        setFormData(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching hospital:", err);
        alert("Could not load hospital data.");
        navigate("/my-hospitals");
      }
    }

    if (token) fetchHospital();
  }, [id, token, navigate]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.startsWith("available") ? Number(value) : value,
    }));
  }

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

  if (loading) return <p>Loading hospital data...</p>;

  return (
    <div className="edit-hospital-form" style={{ padding: "2rem" }}>
      <h2>✏️ Edit Hospital</h2>

      <form onSubmit={handleSubmit} className="form-container">
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Address:
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Type:
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="general">General</option>
            <option value="specialized">Specialized</option>
            <option value="clinic">Clinic</option>
          </select>
        </label>

        <label>
          Available Beds:
          <input
            type="number"
            name="availableBeds"
            value={formData.availableBeds}
            onChange={handleChange}
            min="0"
          />
        </label>

        <label>
          Available Oxygen Units:
          <input
            type="number"
            name="availableOxygen"
            value={formData.availableOxygen}
            onChange={handleChange}
            min="0"
          />
        </label>

        <label>
          Available Ambulances:
          <input
            type="number"
            name="ambulancesAvailable"
            value={formData.ambulancesAvailable}
            onChange={handleChange}
            min="0"
          />
        </label>

        <button type="submit" className="btn">
          ✅ Save Changes
        </button>
        <button
          type="button"
          className="btn"
          style={{ marginLeft: "1rem" }}
          onClick={() => navigate("/my-hospitals")}
        >
          🔙 Cancel
        </button>
      </form>
    </div>
  );
}

export default EditHospital;
