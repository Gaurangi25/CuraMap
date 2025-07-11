import React, { useState, useEffect } from "react";
import AddHospitalForm from "./components/AddHospitalForm";
import HospitalDetails from "./components/HospitalDetails";
import HospitalMap from "./components/HospitalMap";
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
        style={{ display: "flex", justifyContent: "flex-end", padding: "1rem" }}
      >
        <button onClick={toggleTheme} className="theme-toggle-btn">
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      <HospitalMap />
      <HospitalDetails />
      <AddHospitalForm />
    </div>
  );
}

export default App;
