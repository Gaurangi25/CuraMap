import React from "react";
import { Link } from "react-router-dom";
import "./HospitalCard.css";

function HospitalCard({
  hospital,
  isSelected,
  onSelect,
  userLocation,
  distance,
}) {
  if (!hospital) return null;

  // Extract bed availability (support both V2 flat OSM format and MongoDB availability subdoc)
  const beds =
    hospital.availability?.availableBeds ??
    hospital.availableBeds ??
    (hospital.totalBeds ? `${hospital.totalBeds} total` : null);

  const oxygen =
    hospital.availability?.oxygenUnits ??
    hospital.availableOxygen ??
    null;

  const ambulances =
    hospital.availability?.ambulances ??
    hospital.ambulancesAvailable ??
    null;

  const formattedDistance =
    distance !== undefined && distance !== null
      ? Number(distance).toFixed(1)
      : null;

  const handleDirections = (e) => {
    e.stopPropagation();
    if (hospital.latitude && hospital.longitude) {
      const origin = userLocation
        ? `${userLocation.lat},${userLocation.lng}`
        : "";
      const dest = `${hospital.latitude},${hospital.longitude}`;
      const url = origin
        ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`
        : `https://www.google.com/maps/search/?api=1&query=${dest}`;
      window.open(url, "_blank");
    }
  };

  return (
    <div
      className={`hospital-card-item ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect && onSelect(hospital._id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" && onSelect) onSelect(hospital._id);
      }}
    >
      {/* Header Row */}
      <div className="card-header-row">
        <div className="card-title-group">
          <h3 className="hospital-title">{hospital.name || "Hospital"}</h3>
          <div className="hospital-badge-group">
            {hospital.type && (
              <span className={`badge-pill ${hospital.type.toLowerCase()}`}>
                {hospital.type}
              </span>
            )}
            {hospital.verified && (
              <span className="badge-verified">✓ Verified Directory</span>
            )}
            {hospital.source && (
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "var(--text-secondary)",
                  background: "var(--bg-muted)",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                {hospital.source.includes("Government")
                  ? "Gov Data"
                  : "OSM"}
              </span>
            )}
          </div>
        </div>

        {formattedDistance && (
          <div className="hospital-distance-badge" title="Distance from your location">
            📍 {formattedDistance} km
          </div>
        )}
      </div>

      {/* Address */}
      <p className="hospital-address">
        {hospital.address || "Address details available in profile"}
      </p>

      {/* Meta (phone, speciality) */}
      {(hospital.phone || hospital.speciality) && (
        <div className="hospital-meta">
          {hospital.phone && (
            <span className="meta-item">
              📞 <strong>{hospital.phone}</strong>
            </span>
          )}
          {hospital.speciality && (
            <span className="meta-item">
              🩺 {hospital.speciality}
            </span>
          )}
        </div>
      )}

      {/* Resource Indicators Grid */}
      <div className="card-resources-grid">
        <div className="resource-pill">
          <span className="resource-label">🛏️ Beds</span>
          <span
            className={`resource-value ${
              beds !== null && beds !== undefined ? "available" : "empty"
            }`}
          >
            {beds !== null && beds !== undefined ? beds : "Unreported"}
          </span>
        </div>

        <div className="resource-pill">
          <span className="resource-label">💨 Oxygen</span>
          <span
            className={`resource-value ${
              oxygen !== null && oxygen !== undefined ? "available" : "empty"
            }`}
          >
            {oxygen !== null && oxygen !== undefined
              ? `${oxygen} units`
              : "Unreported"}
          </span>
        </div>

        <div className="resource-pill">
          <span className="resource-label">🚑 Ambulances</span>
          <span
            className={`resource-value ${
              ambulances !== null && ambulances !== undefined
                ? "available"
                : "empty"
            }`}
          >
            {ambulances !== null && ambulances !== undefined
              ? ambulances
              : "Unreported"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="card-actions-row">
        <button
          type="button"
          className="card-btn card-btn-primary"
          onClick={(e) => {
            e.stopPropagation();
            if (onSelect) onSelect(hospital._id);
          }}
        >
          📍 Map Focus
        </button>

        <button
          type="button"
          className="card-btn card-btn-secondary"
          onClick={handleDirections}
        >
          🧭 Directions
        </button>

        <Link
          to={`/hospital/${hospital._id}`}
          className="card-btn card-btn-outline"
          onClick={(e) => e.stopPropagation()}
        >
          Details →
        </Link>
      </div>
    </div>
  );
}

export default HospitalCard;
