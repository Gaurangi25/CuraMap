import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  // Public / Patient User entry
  const handleUserClick = () => {
    navigate("/user");
  };

  // Hospital Admin entry: smart routing based on role
  const handleAdminClick = () => {
    if (token) {
      if (user?.role === "hospital_admin") {
        navigate("/hospital-admin");
      } else if (user?.role === "super_admin") {
        navigate("/super-admin");
      } else {
        navigate("/hospital-admin-request");
      }
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="landing-hero-section">
      {/* Eyebrow Badge */}
      <div className="hero-badge-pill">
        <span>🚑 Emergency Healthcare Discovery</span>
        <span>•</span>
        <span>Version 2 Automated Sync</span>
      </div>

      {/* Main Headline */}
      <h1 className="hero-headline">
        Find Critical Care Facilities{" "}
        <span className="hero-headline-gradient">When Seconds Count.</span>
      </h1>

      {/* Subtitle */}
      <p className="hero-description">
        CuraMap connects citizens and emergency responders with real-time hospital resource
        availability—including beds, oxygen units, and ambulances—powered by live OpenStreetMap
        data and the National Government Hospital Directory.
      </p>

      {/* Dual Role Gateway Cards */}
      <div className="gateway-cards-grid">
        {/* Card 1: Patients & Public */}
        <div className="gateway-card">
          <div className="gateway-icon-box">🔍</div>

          <h2 className="gateway-title">Find Nearby Hospitals</h2>

          <p className="gateway-text">
            Search facilities within 2 to 50 km of your location. Instantly check available
            beds, oxygen supplies, and dispatchable ambulances with turn-by-turn driving directions.
          </p>

          <ul className="gateway-feature-list">
            <li className="gateway-feature-item">
              <span className="feature-check">✓</span> Live radius geo-search & clustering
            </li>
            <li className="gateway-feature-item">
              <span className="feature-check">✓</span> Real-time bed, oxygen & ambulance data
            </li>
            <li className="gateway-feature-item">
              <span className="feature-check">✓</span> 1-click Google Maps navigation
            </li>
          </ul>

          <button
            type="button"
            onClick={handleUserClick}
            className="gateway-btn gateway-btn-primary"
          >
            Explore Hospitals Now →
          </button>
        </div>

        {/* Card 2: Hospital Administrators */}
        <div className="gateway-card admin">
          <div className="gateway-icon-box">🏥</div>

          <h2 className="gateway-title">Hospital Administration</h2>

          <p className="gateway-text">
            Authorized hospital personnel can register their facility, manage availability,
            and log critical resource metrics to keep emergency responders and patients informed.
          </p>

          <ul className="gateway-feature-list">
            <li className="gateway-feature-item">
              <span className="feature-check">✓</span> Official facility claim & verification
            </li>
            <li className="gateway-feature-item">
              <span className="feature-check">✓</span> Instant resource & ICU bed logging
            </li>
            <li className="gateway-feature-item">
              <span className="feature-check">✓</span> Emergency availability status controls
            </li>
          </ul>

          <button
            type="button"
            onClick={handleAdminClick}
            className="gateway-btn gateway-btn-emerald"
          >
            {token
              ? user?.role === "hospital_admin"
                ? "Open Admin Portal →"
                : "Submit Admin Verification →"
              : "Sign In as Hospital Admin →"}
          </button>
        </div>
      </div>

      {/* Trust & Scale Metrics Strip */}
      <div className="landing-metrics-strip">
        <div className="metric-highlight-item">
          <span className="metric-number">30,000+</span>
          <span className="metric-label">Verified Facilities</span>
        </div>

        <div className="metric-highlight-item">
          <span className="metric-number">Real-Time</span>
          <span className="metric-label">Automated OSM Sync</span>
        </div>

        <div className="metric-highlight-item">
          <span className="metric-number">100%</span>
          <span className="metric-label">National Directory Verified</span>
        </div>

        <div className="metric-highlight-item">
          <span className="metric-number">Role-Based</span>
          <span className="metric-label">Super-Admin Governance</span>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
