import React, { useEffect, useState } from "react";
import axios from "axios";

function HospitalAdminDashboard() {
  const API =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    availableBeds: "",
    icuBeds: "",
    oxygenUnits: "",
    ventilators: "",
    ambulances: "",
    emergencyStatus: "Available",
  });

  const token = localStorage.getItem("token");

  // ================= GET MY HOSPITAL =================
  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const response = await axios.get(
          `${API}/api/hospitals/mine`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data;

        setHospital(data);

        setForm({
          availableBeds:
            data.availability?.availableBeds ?? "",
          icuBeds:
            data.availability?.icuBeds ?? "",
          oxygenUnits:
            data.availability?.oxygenUnits ?? "",
          ventilators:
            data.availability?.ventilators ?? "",
          ambulances:
            data.availability?.ambulances ?? "",
          emergencyStatus:
            data.availability?.emergencyStatus || "Available",
        });
      } catch (err) {
        console.error("Error fetching hospital:", err);

        alert(
          err.response?.data?.error ||
            "Could not load your hospital"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHospital();
  }, [API, token]);

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= UPDATE AVAILABILITY =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hospital) return;

    setSaving(true);

    try {
      const response = await axios.patch(
        `${API}/api/hospitals/${hospital._id}/availability`,
        {
          availableBeds:
            form.availableBeds === ""
              ? null
              : Number(form.availableBeds),

          icuBeds:
            form.icuBeds === ""
              ? null
              : Number(form.icuBeds),

          oxygenUnits:
            form.oxygenUnits === ""
              ? null
              : Number(form.oxygenUnits),

          ventilators:
            form.ventilators === ""
              ? null
              : Number(form.ventilators),

          ambulances:
            form.ambulances === ""
              ? null
              : Number(form.ambulances),

          emergencyStatus: form.emergencyStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHospital(response.data.hospital);

      alert("Hospital availability updated successfully!");
    } catch (err) {
      console.error("Error updating availability:", err);

      alert(
        err.response?.data?.error ||
          "Could not update hospital availability"
      );
    } finally {
      setSaving(false);
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div style={styles.container}>
        <h1>Hospital Admin Dashboard</h1>
        <p>Loading hospital information...</p>
      </div>
    );
  }

  // ================= NO HOSPITAL =================
  if (!hospital) {
    return (
      <div style={styles.container}>
        <h1>Hospital Admin Dashboard</h1>
        <p>No hospital is assigned to this account.</p>
      </div>
    );
  }

  const lastUpdated =
    hospital.availability?.lastUpdated;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>
          Hospital Admin Dashboard
        </h1>

        {/* ================= HOSPITAL INFO ================= */}
        <div style={styles.hospitalInfo}>
          <h2>{hospital.name}</h2>

          <p>
            <strong>Address:</strong>{" "}
            {hospital.address || "Not available"}
          </p>

          <p>
            <strong>Phone:</strong>{" "}
            {hospital.phone || "Not available"}
          </p>
        </div>

        <hr />

        {/* ================= AVAILABILITY ================= */}
        <h2>Update Hospital Availability</h2>

        <form onSubmit={handleSubmit}>
          <div style={styles.grid}>
            <div style={styles.field}>
              <label>Available Beds</label>

              <input
                type="number"
                min="0"
                name="availableBeds"
                value={form.availableBeds}
                onChange={handleChange}
                placeholder="Enter available beds"
              />
            </div>

            <div style={styles.field}>
              <label>ICU Beds</label>

              <input
                type="number"
                min="0"
                name="icuBeds"
                value={form.icuBeds}
                onChange={handleChange}
                placeholder="Enter ICU beds"
              />
            </div>

            <div style={styles.field}>
              <label>Oxygen Units</label>

              <input
                type="number"
                min="0"
                name="oxygenUnits"
                value={form.oxygenUnits}
                onChange={handleChange}
                placeholder="Enter oxygen units"
              />
            </div>

            <div style={styles.field}>
              <label>Ventilators</label>

              <input
                type="number"
                min="0"
                name="ventilators"
                value={form.ventilators}
                onChange={handleChange}
                placeholder="Enter ventilators"
              />
            </div>

            <div style={styles.field}>
              <label>Ambulances</label>

              <input
                type="number"
                min="0"
                name="ambulances"
                value={form.ambulances}
                onChange={handleChange}
                placeholder="Enter ambulances"
              />
            </div>

            <div style={styles.field}>
              <label>Emergency Status</label>

              <select
                name="emergencyStatus"
                value={form.emergencyStatus}
                onChange={handleChange}
              >
                <option value="Available">
                  Available
                </option>

                <option value="Limited">
                  Limited
                </option>

                <option value="Unavailable">
                  Unavailable
                </option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={styles.button}
          >
            {saving
              ? "Updating..."
              : "Update Availability"}
          </button>
        </form>

        {/* ================= LAST UPDATED ================= */}
        <div style={styles.updated}>
          <strong>Last Updated:</strong>{" "}
          {lastUpdated
            ? new Date(lastUpdated).toLocaleString()
            : "Not updated yet"}
        </div>
      </div>
    </div>
  );
}

// ================= STYLES =================

const styles = {
  container: {
    minHeight: "100vh",
    padding: "40px 20px",
    background: "#f5f5f5",
  },

  card: {
    maxWidth: "900px",
    margin: "0 auto",
    background: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },

  title: {
    marginBottom: "25px",
  },

  hospitalInfo: {
    marginBottom: "25px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  button: {
    marginTop: "30px",
    padding: "12px 24px",
    fontSize: "16px",
    cursor: "pointer",
  },

  updated: {
    marginTop: "25px",
    padding: "15px",
    background: "#f0f0f0",
    borderRadius: "8px",
  },
};

export default HospitalAdminDashboard;