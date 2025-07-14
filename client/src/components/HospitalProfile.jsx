/*
When user clicks a hospital, this page opens
Fetches hospital using ID and shows complete details
*/

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
//import "./HospitalProfile.css";

function HospitalProfile() {
  const { id } = useParams();
  const [hospital, setHospital] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/hospitals/${id}`)
      .then((res) => setHospital(res.data))
      .catch((err) => console.log("Error fetching hospital by ID", err));
  }, [id]);

  if (!hospital) return <p>Loading hospital info...</p>;

  return (
    <div className="hospital-profile">
      <Link to="/" className="back-link">
        ← Back to Hospitals
      </Link>

      <h2>{hospital.name}</h2>
      <p>
        <strong>Address:</strong> {hospital.address}
      </p>
      <p>
        <strong>Phone:</strong> {hospital.phone || "N/A"}
      </p>
      <p>
        <strong>Type:</strong> {hospital.type}
      </p>
      <p>
        <strong>Status:</strong>{" "}
        {hospital.openNow ? "🟢 Open Now" : "🔴 Closed"}
      </p>
      <p>
        <strong>Verified:</strong> {hospital.verified ? "✅ Yes" : "❌ No"}
      </p>
      <p>
        <strong>Available Beds:</strong> {hospital.availableBeds}
      </p>
      <p>
        <strong>Oxygen Units:</strong> {hospital.availableOxygen}
      </p>
      <p>
        <strong>Ambulances:</strong> {hospital.ambulancesAvailable}
      </p>
      <p>
        <strong>Latitude:</strong> {hospital.latitude}
      </p>
      <p>
        <strong>Longitude:</strong> {hospital.longitude}
      </p>
      <p>
        <strong>Reports:</strong> ⚠️ {hospital.reportCount}
      </p>
      <p>
        <strong>Last Updated:</strong>{" "}
        {new Date(hospital.lastUpdated).toLocaleString()}
      </p>
    </div>
  );
}

export default HospitalProfile;
