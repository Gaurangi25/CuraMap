// MyHospitals.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function MyHospitals() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    async function fetchHospitals() {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/hospitals/mine`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setHospitals(res.data);
      } catch (err) {
        console.error("Error fetching hospitals:", err);
      }
    }

    if (token) fetchHospitals();
  }, [token]);

  async function handleDelete(id) {
    const confirm = window.confirm(
      "Are you sure you want to delete this hospital?"
    );

    if (!confirm) return;

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/api/hospitals/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setHospitals((prev) => prev.filter((h) => h._id !== id));
      alert("Hospital deleted successfully.");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Could not delete hospital");
    }
  }

  return (
    <div className="my-hospitals-container">
      <h2>My Hospital Entries</h2>

      <p className="my-hospitals-text">
        Logged in as:{" "}
        <strong>{user?.name || user?.email || "Unknown user"}</strong>
      </p>

      <div className="my-hospitals-add">
        <button onClick={() => navigate("/admin")} className="my-hospitals-btn">
          ➕ Add New Hospital
        </button>

        <button
          onClick={() => navigate("/dashboard")}
          className="my-hospitals-btn"
        >
          🧭 Back to Dashboard
        </button>
      </div>

      {hospitals.length === 0 ? (
        <p>
          You haven’t added any hospitals yet.. Click "Add New Hospital" to
          begin.
        </p>
      ) : (
        hospitals.map((hospital) => (
          <div key={hospital._id} className="hospital-card">
            <h3>{hospital.name}</h3>
            <p>Type: {hospital.type}</p>
            <p>Address: {hospital.address}</p>
            <p>Available Beds: {hospital.availableBeds}</p>
            <p>Available Oxygen Units: {hospital.availableOxygen}</p>
            <p>Available Ambulances: {hospital.ambulancesAvailable}</p>

            {/* TO EDIT AN EXISTING HOSPITAL DETAILS */}
            <div className="my-hospitals-actions">
              <button
                className="my-hospitals-btn edit"
                onClick={() => navigate(`/edit-hospital/${hospital._id}`)}
              >
                ✏️ Edit
              </button>

              {/* TO DELETE A HOSPITAL */}
              <button
                className="my-hospitals-btn delete"
                onClick={() => handleDelete(hospital._id)}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default MyHospitals;
