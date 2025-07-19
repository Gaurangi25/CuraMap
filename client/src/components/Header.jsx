import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

function Header() {
  const [darkMode, setDarkMode] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

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

  const handleLogout = () => {
    if (!user) {
      alert("You're already logged out.");
      return;
    }

    console.log("Logout is called");
    alert("Logout Successful!");
    logout();
    navigate("/");
  };

  return (
    <header className="header">
      <Link to="/" className="header-logo">
        Curamap
      </Link>

      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/admin">Add Hospital</Link>
        <Link to="/my-hospitals">My Entries</Link>
        <span onClick={handleLogout} className="logout-link">
          Logout
        </span>
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
          <div className="toggle-pill"></div>
        </div>
      </div>
    </header>
  );
}

export default Header;
