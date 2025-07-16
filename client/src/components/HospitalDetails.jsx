import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./HospitalDetails.css";

/*
Right now, I’m trying to connect my frontend (React) with my backend (Express + MongoDB).

I already have hospital data stored in MongoDB, and my backend is ready to send that data through an API at:

http://localhost:5000/api/hospitals

Tech you'll use:
useState() → to store hospital data
useEffect() → to fetch data when component loads
fetch() or axios → to call the API
useNavigate() → to redirect to /hospital/:id on card click
*/

function HospitalDetails() {
  const [hospitals, setHospitals] = useState([]);
  const [filterType, setFilterType] = useState(""); // for govt or public filters
  const [openNow, setOpenNow] = useState(false); //to show if hospital is available right now or not
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  // to fetch data from the backend
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/api/hospitals`) //backend endpoint
      .then((res) => setHospitals(res.data)) //save data to setHospitals
      .catch((err) => {
        console.log("Error fetch Hospital List : ", err);
      });
  }, []);

  // Apply filters: type, openNow, and search
  const filteredHospitals = hospitals.filter((hospital) => {
    const matchesType = filterType ? hospital.type === filterType : true;

    const matchesOpen = openNow ? hospital.openNow === true : true;

    const matchesSearch =
      hospital.name.toLowerCase().includes(search.toLowerCase()) ||
      hospital.address.toLowerCase().includes(search.toLowerCase());

    return matchesType && matchesOpen && matchesSearch;
  });

  function handleChange(event) {
    setFilterType(event.target.value);
  }

  function handleShowOpen(event) {
    setOpenNow(event.target.checked);
  }

  function handleReport(id) {
    axios
      .patch(`${process.env.REACT_APP_API_BASE_URL}/api/hospitals/${id}/report`)
      .then((res) => {
        console.log("Reported", res.data);

        setHospitals((prev) =>
          prev.map((x) =>
            x._id === id ? { ...x, reportCount: (x.reportCount || 0) + 1 } : x
          )
        );
      })
      .catch((err) => console.log("Report Failed!", err));
    //console.log("Report button is triggered with id ", id);
  }

  return (
    <div className="hos-details-wrapper">
      {/* Filters */}
      <div className="hos-details-filters">
        <select onChange={handleChange} value={filterType}>
          <option value="">All Types</option>
          <option value="general">General</option>
          <option value="specialized">Specialized</option>
          <option value="clinic">Clinic</option>
        </select>

        <label className="hos-details-open-now-label">
          <input type="checkbox" checked={openNow} onChange={handleShowOpen} />
          Open Now
        </label>

        {/* 🔍 Search bar */}
        <input
          type="text"
          placeholder="Search hospital..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="hos-details-search-input"
        />
      </div>

      {/* Title */}
      <h2 className="hos-details-title">🏥 Nearby Hospitals</h2>

      {/* 🧾 Hospital List */}
      <div className="hos-details-list">
        {filteredHospitals.map((hospital) => (
          <div
            className="hos-details-card"
            key={hospital._id}
            onClick={() => navigate(`/hospital/${hospital._id}`)} // 👈 redirects to hospital profile
            style={{ cursor: "pointer" }} // ✨ UX: indicates it's clickable
          >
            <div className="hos-details-header">
              <h3>{hospital.name}</h3>
              <span className={`hos-details-badge ${hospital.type}`}>{hospital.type}</span>
            </div>

            <p className="hos-details-address">{hospital.address}</p>
            <p className="hos-details-status">
              status : {hospital.openNow ? "🟢 Open Now" : "🔴 Closed"}
            </p>

            <button
              className={`hos-details-report-btn ${
                hospital.reportCount > 0 ? "reported" : ""
              }`}
              onClick={(e) => {
                e.stopPropagation(); // 🚫 Prevent click bubbling to card
                handleReport(hospital._id);
              }}
              disabled={hospital.reportCount > 0}
            >
              {hospital.reportCount > 0 ? "✅ Reported" : "⚠️ Report Issue"}
            </button>

            <p className="hos-details-report-count">
              ⚠️ Reports: {hospital.reportCount || 0}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HospitalDetails;
