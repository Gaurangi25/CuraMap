import React, { useState, useEffect } from "react";

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

  // to fetch data from the backend
  useEffect(() => {
    fetch("http://localhost:5000/api/hospitals") //backend endpoint
      .then((res) => res.json()) //convert response to json format
      .then((data) => setHospitals(data)) //save data to setHospitals
      .catch((err) => {
        console.log("Error fetch Hospital List : ", err);
      });
  }, []);
  return (
    <div>
      <h2>Nearby Hospitals</h2>
      <ul>
        {hospitals.map((hospital, index) => (
          <li key={index}>
            <strong>{hospital.name}</strong>- {hospital.address}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HospitalDetails;
