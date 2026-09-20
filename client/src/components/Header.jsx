import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("curamap_theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.body.classList.add("dark-mode");
    }
  }, []);

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.body.classList.add("dark-mode");
        localStorage.setItem("curamap_theme", "dark");
      } else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("curamap_theme", "light");
      }
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header-wrapper">
      <div className="header-container">
        {/* Brand Logo */}
        <Link to="/" className="header-brand">
          <span className="brand-icon">🏥</span>
          <span className="brand-name">CuraMap</span>
          <span className="brand-badge">Live v2</span>
        </Link>

        {/* Navigation Links */}
        <nav className="header-nav">
          <Link
            to="/"
            className={`nav-item ${isActive("/") ? "active" : ""}`}
          >
            Home
          </Link>

          {/* Regular User Navigation */}
          {(!user || user.role === "user") && (
            <>
              <Link
                to="/user"
                className={`nav-item ${
                  isActive("/user") || isActive("/dashboard") ? "active" : ""
                }`}
              >
                Find Hospitals
              </Link>

              {user && (
                <Link
                  to="/hospital-admin-request"
                  className={`nav-item ${
                    isActive("/hospital-admin-request") ? "active" : ""
                  }`}
                >
                  Verify Hospital Admin
                </Link>
              )}
            </>
          )}

          {/* Hospital Admin Navigation */}
          {user?.role === "hospital_admin" && (
            <>
              <Link
                to="/hospital-admin"
                className={`nav-item ${
                  isActive("/hospital-admin") ? "active" : ""
                }`}
              >
                Resource Dashboard
              </Link>

              <Link
                to="/my-hospitals"
                className={`nav-item ${
                  isActive("/my-hospitals") ? "active" : ""
                }`}
              >
                My Hospital
              </Link>
            </>
          )}

          {/* Super Admin Navigation */}
          {user?.role === "super_admin" && (
            <Link
              to="/super-admin"
              className={`nav-item ${
                isActive("/super-admin") ? "active" : ""
              }`}
            >
              Admin Approvals
            </Link>
          )}
        </nav>

        {/* Right Actions: Theme Toggle, User Pill, and Auth Buttons */}
        <div className="header-actions">
          {/* Theme Toggle */}
          <button
            type="button"
            className="theme-toggle-button"
            onClick={toggleTheme}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          {/* User Logged In State */}
          {user ? (
            <>
              <div className="user-profile-pill">
                <div className="user-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <span style={{ fontWeight: 600 }}>{user.name || "User"}</span>
                <span className={`user-role-tag ${user.role}`}>
                  {user.role === "hospital_admin"
                    ? "Admin"
                    : user.role === "super_admin"
                    ? "Super Admin"
                    : "Patient/User"}
                </span>
              </div>

              <button
                type="button"
                className="header-logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            /* Guest / Logged Out State */
            <>
              <Link to="/login" className="auth-btn-ghost">
                Sign In
              </Link>
              <Link to="/signup" className="auth-btn-primary">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;