import React, { useState, useEffect } from "react";
import axios from "axios";
import "./HospitalDetails.css";

/*
Right now, I’m trying to connect my frontend (React) with my backend (Express + MongoDB).

I already have hospital data stored in MongoDB, and my backend is ready to send that data through an API at:

http://localhost:5000/api/hospitals

Tech you'll use:
useState() → to store hospital data
useEffect() → to fetch data when component loads
fetch() or axios → to call the API

*/

function HospitalDetails() {
  const [hospitals, setHospitals] = useState([]);
  const [filterType, setFilterType] = useState(""); // for govt or public filters
  const [openNow, setOpenNow] = useState(false); //to show if hospital is available right now or not
  const [search, setSearch] = useState("");

  // to fetch data from the backend
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/hospitals") //backend endpoint
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
      .patch(`http://localhost:5000/api/hospitals/${id}/report`)
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
    <div className="hospital-wrapper">
      {/* Filters */}
      <div className="filters">
        <select onChange={handleChange} value={filterType}>
          <option value="">All Types</option>
          <option value="govt">Government</option>
          <option value="private">Private</option>
        </select>

        <label className="open-now-label">
          <input type="checkbox" checked={openNow} onChange={handleShowOpen} />
          Open Now
        </label>

        {/* 🔍 Search bar */}
        <input
          type="text"
          placeholder="Search hospital..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Title */}
      <h2 className="hospital-title">🏥 Nearby Hospitals</h2>

      {/* Hospital List */}
      <div className="hospital-list">
        {filteredHospitals.map((hospital) => (
          <div className="hospital-card" key={hospital._id}>
            <div className="hospital-header">
              <h3>{hospital.name}</h3>
              <span className={`badge ${hospital.type}`}>{hospital.type}</span>
            </div>

            {/*Address Block*/}
            <p className="address">{hospital.address}</p>

            {/* Check Open Now or not */}
            <p>status : {hospital.openNow ? "🟢 Open Now" : "🔴 Closed"}</p>

            {/* Button */}
            <button
              className={`report-btn ${
                hospital.reportCount > 0 ? "reported" : ""
              }`}
              onClick={() => handleReport(hospital._id)}
              disabled={hospital.reportCount > 0}
            >
              {hospital.reportCount > 0 ? "✅ Reported" : "⚠️ Report Issue"}
            </button>

            <p className="report-count">
              ⚠️ Reports: {hospital.reportCount || 0}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HospitalDetails;
