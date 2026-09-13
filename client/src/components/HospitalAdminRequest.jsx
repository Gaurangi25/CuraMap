import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function HospitalAdminRequest() {
  const [hospitals, setHospitals] = useState([]);
  const [hospitalId, setHospitalId] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [designation, setDesignation] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingHospitals, setFetchingHospitals] = useState(true);

  const navigate = useNavigate();

  const API =
    process.env.REACT_APP_API_BASE_URL ||
    "http://localhost:5000";

  // Get hospitals
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await axios.get(
          `${API}/api/hospitals`
        );

        setHospitals(response.data);
      } catch (err) {
        console.error(
          "Error fetching hospitals:",
          err
        );

        alert("Unable to load hospitals.");
      } finally {
        setFetchingHospitals(false);
      }
    };

    fetchHospitals();
  }, [API]);

  // Submit request
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !hospitalId ||
      !officialEmail ||
      !designation
    ) {
      alert("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      await axios.post(
        `${API}/api/hospital-admin/request`,
        {
          hospitalId,
          officialEmail,
          designation,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        "Hospital Admin request submitted successfully. It is now pending verification."
      );

      navigate("/dashboard");
    } catch (err) {
      console.error(
        "Hospital Admin request error:",
        err
      );

      alert(
        err.response?.data?.error ||
          "Failed to submit request."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        padding: "30px",
        border: "1px solid #ddd",
        borderRadius: "12px",
      }}
    >
      <h1>Hospital Admin Verification</h1>

      <p>
        Request access to manage your hospital's
        availability information.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Hospital */}
        <div style={{ marginBottom: "20px" }}>
          <label>
            <strong>Select Hospital</strong>
          </label>

          <select
            value={hospitalId}
            onChange={(e) =>
              setHospitalId(e.target.value)
            }
            disabled={fetchingHospitals}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "8px",
            }}
          >
            <option value="">
              {fetchingHospitals
                ? "Loading hospitals..."
                : "Select a hospital"}
            </option>

            {hospitals.map((hospital) => (
              <option
                key={hospital._id}
                value={hospital._id}
              >
                {hospital.name}
                {hospital.address
                  ? ` - ${hospital.address}`
                  : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Official Email */}
        <div style={{ marginBottom: "20px" }}>
          <label>
            <strong>Official Hospital Email</strong>
          </label>

          <input
            type="email"
            value={officialEmail}
            onChange={(e) =>
              setOfficialEmail(e.target.value)
            }
            placeholder="example@hospital.com"
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "8px",
            }}
          />
        </div>

        {/* Designation */}
        <div style={{ marginBottom: "20px" }}>
          <label>
            <strong>Designation</strong>
          </label>

          <input
            type="text"
            value={designation}
            onChange={(e) =>
              setDesignation(e.target.value)
            }
            placeholder="Hospital Administrator"
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "8px",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || fetchingHospitals}
          style={{
            padding: "12px 25px",
            cursor: "pointer",
          }}
        >
          {loading
            ? "Submitting..."
            : "Submit Verification Request"}
        </button>
      </form>
    </div>
  );
}

export default HospitalAdminRequest;