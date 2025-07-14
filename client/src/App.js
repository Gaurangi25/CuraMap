import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import AddHospitalForm from "./components/AddHospitalForm";
import HospitalDetails from "./components/HospitalDetails";
import HospitalMap from "./components/HospitalMap";
import "./index.css";
import HospitalProfile from "./components/HospitalProfile";
import LandingPage from "./components/LandingPage";
import MyHospitals from "./components/MyHospitals";

import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import OAuthHandler from "./components/OAuthHandler";

import "./index.css";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      setDarkMode(true);
      document.body.classList.add("dark-mode");
    }
  }, []);

  // Toggle between dark and light mode
  function toggleTheme() {
    setDarkMode((prev) => {
      const newMode = !prev;
      document.body.classList.toggle("dark-mode", newMode);
      localStorage.setItem("theme", newMode ? "dark" : "light");
      return newMode;
    });
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "1rem",
        }}
      >
        <button onClick={toggleTheme} className="theme-toggle-btn">
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

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
                <HospitalMap />
                <HospitalDetails />
              </>
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
