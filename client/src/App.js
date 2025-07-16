import React from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import AddHospitalForm from "./components/AddHospitalForm";
import HospitalDetails from "./components/HospitalDetails";
import HospitalMap from "./components/HospitalMap";
import "./index.css";
import HospitalProfile from "./components/HospitalProfile";
import LandingPage from "./components/LandingPage";
import MyHospitals from "./components/MyHospitals";
import EditHospital from "./components/EditHospital";

import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import OAuthHandler from "./components/OAuthHandler";

import "./index.css";

function App() {
  return (
    <div>
      <Header />

      {/* Routes */}
      <Routes>
        {/* LANDING PAGE INFO */}
        <Route path="/" element={<LandingPage />} />

        {/* HOSPITAL ADMIN ENTRY */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AddHospitalForm />
            </PrivateRoute>
          }
        />

        {/* SHOW HOSPITALS FROM AN ADMIN*/}
        <Route
          path="/my-hospitals"
          element={
            <PrivateRoute>
              <MyHospitals />
            </PrivateRoute>
          }
        />

        {/* USER ENTRY - Map + Hospital List */}
        <Route
          path="/user"
          element={
            <PrivateRoute>
              <>
                <HospitalDetails />
                <HospitalMap />
              </>
            </PrivateRoute>
          }
        />

        {/* EDIT AN HOSPITAL DETAILS*/}
        <Route
          path="/edit-hospital/:id"
          element={
            <PrivateRoute>
              <EditHospital />
            </PrivateRoute>
          }
        />

        {/* HOSPITAL DEATILS PAGE */}
        <Route path="/hospital/:id" element={<HospitalProfile />} />

        {/* LOGIN PAGE ROUTE */}
        <Route path="/login" element={<Login />} />

        {/* SIGNUP PAGE ROUTE */}
        <Route path="/signup" element={<Signup />} />

        {/* OAUTH ROUTE */}
        <Route path="/oauth" element={<OAuthHandler />} />

        {/* DASHBOARD ROUTE */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
