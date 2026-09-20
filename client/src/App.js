import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header";
import LandingPage from "./components/LandingPage";
import UserDashboard from "./components/UserDashboard";
import HospitalAdminDashboard from "./components/HospitalAdminDashboard";
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import HospitalAdminRequest from "./components/HospitalAdminRequest";
import HospitalProfile from "./components/HospitalProfile";
import MyHospitals from "./components/MyHospitals";
import EditHospital from "./components/EditHospital";
import Login from "./components/Login";
import Signup from "./components/Signup";
import PrivateRoute from "./components/PrivateRoute";
import OAuthHandler from "./components/OAuthHandler";

import "./index.css";

function App() {
  return (
    <div className="curamap-app-root">
      <Header />

      <main className="curamap-main-content">
        <Routes>
          {/* LANDING PAGE */}
          <Route path="/" element={<LandingPage />} />

          {/* USER / PATIENT DISCOVERY DASHBOARD */}
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/dashboard" element={<UserDashboard />} />

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

          {/* LEGACY ADMIN ROUTE REDIRECT (Preserves backwards compatibility) */}
          <Route
            path="/admin"
            element={<Navigate to="/hospital-admin" replace />}
          />

          {/* MY MANAGED HOSPITALS */}
          <Route
            path="/my-hospitals"
            element={
              <PrivateRoute allowedRoles={["hospital_admin"]}>
                <MyHospitals />
              </PrivateRoute>
            }
          />

          {/* EDIT HOSPITAL PROFILE */}
          <Route
            path="/edit-hospital/:id"
            element={
              <PrivateRoute allowedRoles={["hospital_admin"]}>
                <EditHospital />
              </PrivateRoute>
            }
          />

          {/* HOSPITAL PROFILE & EMERGENCY DETAILS */}
          <Route path="/hospital/:id" element={<HospitalProfile />} />

          {/* BECOME HOSPITAL ADMIN VERIFICATION REQUEST */}
          <Route
            path="/hospital-admin-request"
            element={
              <PrivateRoute allowedRoles={["user"]}>
                <HospitalAdminRequest />
              </PrivateRoute>
            }
          />

          {/* AUTHENTICATION */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/oauth" element={<OAuthHandler />} />

          {/* 404 CATCH-ALL */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
