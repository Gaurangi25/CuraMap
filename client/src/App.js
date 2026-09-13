import React from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import AddHospitalForm from "./components/AddHospitalForm";
import HospitalProfile from "./components/HospitalProfile";
import LandingPage from "./components/LandingPage";
import MyHospitals from "./components/MyHospitals";
import EditHospital from "./components/EditHospital";
import UserDashboard from "./components/UserDashboard";

import Login from "./components/Login";
import Signup from "./components/Signup";
import PrivateRoute from "./components/PrivateRoute";
import OAuthHandler from "./components/OAuthHandler";

import HospitalAdminDashboard from "./components/HospitalAdminDashboard";
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import HospitalAdminRequest from "./components/HospitalAdminRequest";

import "./index.css";

function App() {
  return (
    <div>
      <Header />

      <Routes>
        {/* LANDING PAGE */}
        <Route path="/" element={<LandingPage />} />

        {/* USER DASHBOARD */}
        <Route
          path="/user"
          element={
            <PrivateRoute allowedRoles={["user"]}>
              <UserDashboard />
            </PrivateRoute>
          }
        />

        {/* NORMAL DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={["user"]}>
              <UserDashboard />
            </PrivateRoute>
          }
        />

        {/* HOSPITAL ADMIN DASHBOARD */}
        <Route
          path="/hospital-admin"
          element={
            <PrivateRoute allowedRoles={["hospital_admin"]}>
              <HospitalAdminDashboard />
            </PrivateRoute>
          }
        />

        {/* SUPER ADMIN DASHBOARD */}
        <Route
          path="/super-admin"
          element={
            <PrivateRoute allowedRoles={["super_admin"]}>
              <SuperAdminDashboard />
            </PrivateRoute>
          }
        />

        {/* OLD ADMIN PAGE
            Keep temporarily so we don't break anything.
            We'll remove AddHospitalForm after the new
            admin flow is fully working.
        */}
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={["hospital_admin"]}>
              <AddHospitalForm />
            </PrivateRoute>
          }
        />

        {/* MY HOSPITALS */}
        <Route
          path="/my-hospitals"
          element={
            <PrivateRoute allowedRoles={["hospital_admin"]}>
              <MyHospitals />
            </PrivateRoute>
          }
        />

        {/* EDIT HOSPITAL */}
        <Route
          path="/edit-hospital/:id"
          element={
            <PrivateRoute allowedRoles={["hospital_admin"]}>
              <EditHospital />
            </PrivateRoute>
          }
        />

        {/* HOSPITAL DETAILS */}
        <Route path="/hospital/:id" element={<HospitalProfile />} />

        <Route
          path="/hospital-admin-request"
          element={
            <PrivateRoute allowedRoles={["user"]}>
              <HospitalAdminRequest />
            </PrivateRoute>
          }
        />

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* SIGNUP */}
        <Route path="/signup" element={<Signup />} />

        {/* GOOGLE OAUTH */}
        <Route path="/oauth" element={<OAuthHandler />} />
      </Routes>
    </div>
  );
}

export default App;
