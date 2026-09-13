import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <header
      style={{
        backgroundColor: "#5b18a6",
        padding: "18px 20px",
        textAlign: "center",
        color: "white",
      }}
    >
      <h1
        style={{
          margin: "0 0 22px",
          fontSize: "36px",
          fontWeight: "800",
          letterSpacing: "1px",
        }}
      >
        CURAMAP
      </h1>

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "18px",
        }}
      >
        <Link to="/" style={linkStyle}>
          Home
        </Link>

        {/* Normal User */}
        {user?.role === "user" && (
          <>
            <Link to="/dashboard" style={linkStyle}>
              Dashboard
            </Link>

            <Link to="/hospital-admin-request" style={linkStyle}>
              Become Hospital Admin
            </Link>
          </>
        )}

        {/* Hospital Admin */}
        {user?.role === "hospital_admin" && (
          <>
            <Link to="/hospital-admin" style={linkStyle}>
              Admin Dashboard
            </Link>

            <Link to="/my-hospitals" style={linkStyle}>
              My Hospital
            </Link>
          </>
        )}

        {/* Super Admin */}
        {user?.role === "super_admin" && (
          <Link to="/super-admin" style={linkStyle}>
            Super Admin Dashboard
          </Link>
        )}

        {user && (
          <button
            onClick={handleLogout}
            style={{
              ...linkStyle,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Logout
          </button>
        )}
      </nav>

      <div
        style={{
          width: "110px",
          height: "46px",
          background: "white",
          borderRadius: "25px",
          margin: "25px auto 0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            background: "#ddd",
            borderRadius: "50%",
            margin: "3px",
          }}
        />
      </div>
    </header>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  fontSize: "21px",
  fontWeight: "700",
};

export default Header;