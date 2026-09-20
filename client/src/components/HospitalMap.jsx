import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
  MarkerClusterer,
} from "@react-google-maps/api";
import axios from "axios";
import HospitalCard from "./HospitalCard";
import "./HospitalMap.css";

const mapContainerStyle = {
  width: "100%",
  height: "560px",
  borderRadius: "0 0 16px 16px",
};

const defaultCenter = {
  lat: 28.6139,
  lng: 77.209,
};

const libraries = ["places", "geometry", "marker"];

// Haversine formula to compute great-circle distance in kilometers
const distanceKm = (lat1, lon1, lat2, lon2) => {
  if (
    !Number.isFinite(Number(lat1)) ||
    !Number.isFinite(Number(lon1)) ||
    !Number.isFinite(Number(lat2)) ||
    !Number.isFinite(Number(lon2))
  ) {
    return null;
  }
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return Number((2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
};

const RADIUS_OPTIONS = [
  { label: "2 km", value: 2000 },
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
  { label: "25 km", value: 25000 },
  { label: "50 km", value: 50000 },
];

function HospitalMap() {
  const [hospitals, setHospitals] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [radius, setRadius] = useState(5000);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [search, setSearch] = useState("");

  const searchRequestRef = useRef(null);
  const lastNearbyRequestRef = useRef(null);
  const mapRef = useRef(null);
  const hasFittedNearbyRef = useRef(false);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  // Fetch nearby hospitals from backend API
  useEffect(() => {
    if (!userLocation) return;

    const requestKey = `${userLocation.lat},${userLocation.lng},${radius}`;
    if (lastNearbyRequestRef.current === requestKey) return;
    lastNearbyRequestRef.current = requestKey;

    setLoading(true);

    const apiBase = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
    axios
      .get(
        `${apiBase}/api/hospitals/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&r=${radius}`
      )
      .then((res) => {
        const data = res.data;
        if (Array.isArray(data)) {
          setHospitals(data);
        } else {
          setHospitals([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch nearby hospitals", err);
        lastNearbyRequestRef.current = null;
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userLocation, radius]);

  // Acquire user's current GPS location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          console.warn("Geolocation denied or unavailable. Using default center.");
          setUserLocation(defaultCenter);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setUserLocation(defaultCenter);
    }
  }, []);

  // Search hospitals by name
  const performSearch = useCallback(
    async (searchTerm) => {
      const term = searchTerm.trim();
      if (!term) {
        if (searchRequestRef.current) {
          searchRequestRef.current.abort();
          searchRequestRef.current = null;
        }
        setSearchLoading(false);
        return;
      }

      if (searchRequestRef.current) {
        searchRequestRef.current.abort();
        searchRequestRef.current = null;
      }

      // Check existing in-memory matches first
      const searchText = term.toLowerCase();
      const existingMatches = hospitals.filter((h) =>
        h.name?.toLowerCase().includes(searchText)
      );

      if (existingMatches.length > 0) {
        let nearestHospital = existingMatches[0];
        if (userLocation) {
          nearestHospital = existingMatches.reduce((nearest, hospital) => {
            const hLat = Number(hospital.latitude);
            const hLng = Number(hospital.longitude);
            const nLat = Number(nearest.latitude);
            const nLng = Number(nearest.longitude);

            if (!Number.isFinite(hLat) || !Number.isFinite(hLng)) return nearest;
            if (!Number.isFinite(nLat) || !Number.isFinite(nLng)) return hospital;

            const hDist = distanceKm(userLocation.lat, userLocation.lng, hLat, hLng) ?? Infinity;
            const nDist = distanceKm(userLocation.lat, userLocation.lng, nLat, nLng) ?? Infinity;

            return hDist < nDist ? hospital : nearest;
          }, existingMatches[0]);
        }

        setSelectedId(nearestHospital._id);
        setSearchLoading(false);
        return;
      }

      // Query backend search
      const controller = new AbortController();
      searchRequestRef.current = controller;
      setSearchLoading(true);

      try {
        const apiBase = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
        const params = new URLSearchParams({
          name: term,
          r: radius.toString(),
        });

        if (userLocation) {
          params.set("lat", userLocation.lat.toString());
          params.set("lng", userLocation.lng.toString());
        }

        const res = await axios.get(`${apiBase}/api/hospitals/search?${params.toString()}`, {
          signal: controller.signal,
        });

        if (searchRequestRef.current !== controller) return;

        const results = res.data;
        if (Array.isArray(results) && results.length > 0) {
          const match = results[0];
          setHospitals((prev) => {
            const exists = prev.some((h) => h._id === match._id);
            return exists ? prev : [match, ...prev];
          });
          setSelectedId(match._id);
        } else {
          alert(`No hospital matching "${term}" found within ${radius / 1000} km.`);
        }
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") return;
        console.error("Search failed", err);
        alert("Error while searching hospital");
      } finally {
        if (searchRequestRef.current === controller) {
          searchRequestRef.current = null;
          setSearchLoading(false);
        }
      }
    },
    [hospitals, userLocation, radius]
  );

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch(search);
  };

  const handleClearSearch = () => {
    setSearch("");
    if (searchRequestRef.current) {
      searchRequestRef.current.abort();
      searchRequestRef.current = null;
    }
    setSearchLoading(false);
  };

  // Selected hospital for InfoWindow
  const selectedHospital = Array.isArray(hospitals)
    ? hospitals.find((h) => h._id === selectedId)
    : null;

  // Pan and zoom map when a hospital is selected
  useEffect(() => {
    if (!mapRef.current || !selectedHospital) return;

    const lat = Number(selectedHospital.latitude);
    const lng = Number(selectedHospital.longitude);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(16);
    }
  }, [selectedHospital]);

  // Initial bounds fit on data load
  useEffect(() => {
    if (
      !mapRef.current ||
      !userLocation ||
      hospitals.length === 0 ||
      hasFittedNearbyRef.current
    ) {
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(userLocation);

    hospitals.forEach((h) => {
      const lat = Number(h.latitude);
      const lng = Number(h.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        bounds.extend({ lat, lng });
      }
    });

    mapRef.current.fitBounds(bounds);
    hasFittedNearbyRef.current = true;
  }, [userLocation, hospitals]);

  useEffect(() => {
    hasFittedNearbyRef.current = false;
  }, [radius]);

  // Sort hospitals by distance from user location
  const sortedHospitals = userLocation && Array.isArray(hospitals)
    ? [...hospitals]
        .map((h) => ({
          ...h,
          distanceVal: distanceKm(
            userLocation.lat,
            userLocation.lng,
            h.latitude,
            h.longitude
          ),
        }))
        .sort((a, b) => {
          if (a.distanceVal === null) return 1;
          if (b.distanceVal === null) return -1;
          return a.distanceVal - b.distanceVal;
        })
    : hospitals;

  const handleDirections = () => {
    if (!userLocation || !selectedHospital) return;
    const origin = `${userLocation.lat},${userLocation.lng}`;
    const destination = `${selectedHospital.latitude},${selectedHospital.longitude}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    window.open(url, "_blank");
  };

  const renderMarkers = (clusterer) =>
    hospitals
      .filter(
        (h) =>
          Number.isFinite(Number(h.latitude)) &&
          Number.isFinite(Number(h.longitude))
      )
      .map((h) => (
        <Marker
          key={h._id}
          position={{
            lat: Number(h.latitude),
            lng: Number(h.longitude),
          }}
          title={h.name}
          clusterer={clusterer}
          onClick={() => setSelectedId(h._id)}
          zIndex={selectedId === h._id ? 1000 : 1}
          icon={{
            url:
              selectedId === h._id
                ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                : "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            scaledSize: new window.google.maps.Size(
              selectedId === h._id ? 44 : 36,
              selectedId === h._id ? 44 : 36
            ),
          }}
        />
      ));

  return (
    <div className="discovery-layout">
      {/* Controls Card: Search bar & Radius Filters */}
      <div className="discovery-controls-card">
        <form onSubmit={handleSearchSubmit} className="search-input-wrapper">
          <div className="search-field-container">
            <span className="search-icon-inside">🔍</span>
            <input
              type="text"
              className="modern-search-input"
              placeholder="Search hospitals by name, specialty, or area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={handleClearSearch}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            className="search-submit-btn"
            disabled={searchLoading}
          >
            {searchLoading ? "Searching..." : "Search Facilities"}
          </button>
        </form>

        {/* Radius Selector Pills */}
        <div className="filter-chips-row">
          <div className="radius-chips-group">
            <span className="radius-label">Search Radius:</span>
            {RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`radius-chip ${radius === opt.value ? "active" : ""}`}
                onClick={() => setRadius(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="status-counter-pill">
            🏥 {hospitals.length} facilities detected within {radius / 1000} km
          </div>
        </div>
      </div>

      {/* Loading & Warning Status Messages */}
      {loading && (
        <div className="map-status-banner loading">
          <span>⏳</span>
          <span>Fetching live hospital resources from OpenStreetMap & Government Directory...</span>
        </div>
      )}

      {!loading && hospitals.length === 0 && (
        <div className="map-status-banner empty">
          <span>⚠️</span>
          <span>
            No hospitals located within {radius / 1000} km. Try expanding your search radius to 25 km or 50 km.
          </span>
        </div>
      )}

      {/* Main Split Layout: Map & Hospital Directory List */}
      <div className="discovery-content-grid">
        {/* Left Column: Interactive Map */}
        <div className="map-canvas-card">
          <div className="map-card-header">
            <div className="map-header-title">
              <span>📍</span>
              <span>Interactive Healthcare Geo-Map</span>
            </div>
            <div className="map-header-indicator">
              <span className="live-pulse-dot"></span>
              <span>Live Overpass Sync</span>
            </div>
          </div>

          {loadError && (
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <p>Failed to load Google Maps. Please verify your API key in client/.env.local</p>
            </div>
          )}

          {!isLoaded && !loadError && (
            <div style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--text-secondary)" }}>
              <p>Initializing Google Maps and Healthcare Markers...</p>
            </div>
          )}

          {isLoaded && (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={userLocation || defaultCenter}
              zoom={userLocation ? 13 : 12}
              onLoad={(map) => {
                mapRef.current = map;
              }}
              onUnmount={() => {
                mapRef.current = null;
              }}
              options={{
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: true,
              }}
            >
              <MarkerClusterer zoomOnClick={true} maxZoom={18} averageCenter={true}>
                {(clusterer) => renderMarkers(clusterer)}
              </MarkerClusterer>

              {/* User Location Marker */}
              {userLocation && (
                <Marker
                  position={userLocation}
                  title="Your Current Location"
                  icon={{
                    url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                    scaledSize: new window.google.maps.Size(42, 42),
                  }}
                />
              )}

              {/* InfoWindow for Selected Hospital */}
              {selectedHospital &&
                Number.isFinite(Number(selectedHospital.latitude)) &&
                Number.isFinite(Number(selectedHospital.longitude)) && (
                  <InfoWindow
                    position={{
                      lat: Number(selectedHospital.latitude),
                      lng: Number(selectedHospital.longitude),
                    }}
                    onCloseClick={() => setSelectedId(null)}
                  >
                    <div className="iw-container">
                      <h4 className="iw-title">{selectedHospital.name}</h4>
                      <p className="iw-address">{selectedHospital.address}</p>

                      {userLocation && (
                        <div className="iw-distance">
                          📍 {distanceKm(
                            userLocation.lat,
                            userLocation.lng,
                            selectedHospital.latitude,
                            selectedHospital.longitude
                          )}{" "}
                          km from your location
                        </div>
                      )}

                      {/* Resource Mini-Grid */}
                      <div className="iw-grid">
                        <div className="iw-grid-item">
                          <span>Beds</span>
                          <strong>
                            {selectedHospital.availableBeds ??
                              selectedHospital.totalBeds ??
                              "N/A"}
                          </strong>
                        </div>
                        <div className="iw-grid-item">
                          <span>Oxygen</span>
                          <strong>
                            {selectedHospital.availableOxygen ?? "N/A"}
                          </strong>
                        </div>
                        <div className="iw-grid-item">
                          <span>Ambulances</span>
                          <strong>
                            {selectedHospital.ambulancesAvailable ?? "N/A"}
                          </strong>
                        </div>
                      </div>

                      {selectedHospital.phone && (
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                          📞 {selectedHospital.phone}
                        </div>
                      )}

                      {userLocation && (
                        <button
                          type="button"
                          className="iw-direction-btn"
                          onClick={handleDirections}
                        >
                          🧭 Open Google Directions
                        </button>
                      )}
                    </div>
                  </InfoWindow>
                )}
            </GoogleMap>
          )}
        </div>

        {/* Right Column: Hospital Cards Directory */}
        <div className="hospital-list-pane">
          <div className="list-pane-header">
            <h2 className="list-pane-title">Nearby Facilities</h2>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Sorted by proximity
            </span>
          </div>

          <div className="hospital-cards-scroll">
            {sortedHospitals.map((hospital) => (
              <HospitalCard
                key={hospital._id}
                hospital={hospital}
                isSelected={selectedId === hospital._id}
                onSelect={(id) => setSelectedId(id)}
                userLocation={userLocation}
                distance={hospital.distanceVal}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HospitalMap;
