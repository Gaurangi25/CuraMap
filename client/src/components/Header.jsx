import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

function Header() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.body.classList.add("dark-mode");
    }
  }, []);

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      document.body.classList.toggle("dark-mode", newMode);
      localStorage.setItem("theme", newMode ? "dark" : "light");
      return newMode;
    });
  };

  return (
    <header className="header">
      <div className="header-logo">Curamap</div>

      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/admin">Add Hospital</Link>
        <Link to="/my-hospitals">My Entries</Link>
        <Link to="/logout">Logout</Link>
      </nav>

      {/* <div className="toggle-button-wrapper">
        <button onClick={toggleTheme} className="theme-toggle-btn">
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div> */}

      <div
        className={`toggle-button-wrapper ${darkMode ? "active" : ""}`}
        onClick={toggleTheme}
      >
        <div className="theme-toggle-btn">
          <div className="toggle-pill">
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
