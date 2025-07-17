// components/UserDashboard.jsx

import React from "react";
import HospitalDetails from "./HospitalDetails";
import HospitalMap from "./HospitalMap";

function UserDashboard() {
  return (
    <div className="user-dashboard">
      <HospitalDetails />
      <HospitalMap />
    </div>
  );
}

export default UserDashboard;
