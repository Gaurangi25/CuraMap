import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";

//Fetch hospitals from /api/hospitals → map through them → place <Marker /> for each
import axios from "axios";

// When you have many markers (hospitals) on the map, instead of all showing at once and overlapping, it groups nearby markers into a cluster (with a number) and expands them when zoomed in.
import { MarkerClusterer } from "@react-google-maps/api";

import "./HospitalMap.css";

// size of the map box
const mapSize = {
  //inline styling
  width: "100%",
  height: "400px",
};

// default center point -> delhi
const defaultCenter = {
  lat: 28.6139,
  lng: 77.209,
};

// Add "marker" library to be future ready (as its deprecated currently)
const libraries = ["places", "geometry", "marker"];

// const options = {
//   zoomControl: true,
// };

/*
Haversine formula ->
The standard way to compute the great-circle distance between two latitude/longitude points on Earth.
*/
const distanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return (2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
};

function HospitalMap() {
  const [hospitals, setHospitals] = useState([]);

  // To show active markers -> the one that's clicked
  const [selectedId, setSelectedId] = useState(null);

  // To store the user's current location (latitude & longitude)
  const [userLocation, setUserLocation] = useState(null);

  // Radius in metres
  const [radius, setRadius] = useState(5000);

  const [loading, setLoading] = useState(false);

  // Loading state only for hospital search
  const [searchLoading, setSearchLoading] = useState(false);

  // User input for city or hospital search
  const [search, setSearch] = useState("");

  // Used to cancel the currently running search request
  const searchRequestRef = useRef(null);

  // Prevent the same nearby API request from being made twice
  // in React development mode.
  const lastNearbyRequestRef = useRef(null);

  const mapRef = useRef(null);
  const hasFittedNearbyRef = useRef(false);

  console.log("Hospitals state:", hospitals);

  //load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    // secret API key from .env.local
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  //Fetch hospital data from backend API
  useEffect(() => {
    if (!userLocation) return; // wait for coords

    const requestKey = `${userLocation.lat},${userLocation.lng},${radius}`;

    // Avoid duplicate request with exactly the same location and radius
    if (lastNearbyRequestRef.current === requestKey) {
      return;
    }

    lastNearbyRequestRef.current = requestKey;

    setLoading(true);

    console.log("Making API request to nearby with:", userLocation, radius);

    axios
      .get(
        `${process.env.REACT_APP_API_BASE_URL}/api/hospitals/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&r=${radius}`,
      )
      .then((res) => {
        const data = res.data;

        console.log("Nearby hospitals from API:", data);

        if (Array.isArray(data)) {
          setHospitals(data);
        } else {
          console.warn("⚠️ Invalid hospital data received:", data);

          setHospitals([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch hospitals", err);

        // Allow the same request to be tried again if it failed
        lastNearbyRequestRef.current = null;
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userLocation, radius]);

  // get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Geolocation successful:", position);

          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          console.warn("Geolocation access denied or unavailable");

          setUserLocation(defaultCenter);
        },
      );
    } else {
      setUserLocation(defaultCenter);
    }
  }, []);

  // SEARCH HOSPITAL
  const performSearch = useCallback(
    async (searchTerm) => {
      const term = searchTerm.trim();

      // If search box is empty, cancel current search
      if (!term) {
        if (searchRequestRef.current) {
          searchRequestRef.current.abort();
          searchRequestRef.current = null;
        }

        setSearchLoading(false);
        return;
      }

      // Cancel previous search request before starting a new one
      if (searchRequestRef.current) {
        searchRequestRef.current.abort();
        searchRequestRef.current = null;
      }

      // First check hospitals that are already loaded
      const searchText = term.toLowerCase();

      const existingMatches = hospitals.filter((hospital) =>
        hospital.name?.toLowerCase().includes(searchText),
      );

      /*
        If matching hospitals are already loaded,
        select the NEAREST matching hospital.
      */
      if (existingMatches.length > 0) {
        let nearestHospital = existingMatches[0];

        if (userLocation) {
          nearestHospital = existingMatches.reduce((nearest, hospital) => {
            const hospitalLat = Number(hospital.latitude);

            const hospitalLng = Number(hospital.longitude);

            const nearestLat = Number(nearest.latitude);

            const nearestLng = Number(nearest.longitude);

            if (
              !Number.isFinite(hospitalLat) ||
              !Number.isFinite(hospitalLng)
            ) {
              return nearest;
            }

            if (!Number.isFinite(nearestLat) || !Number.isFinite(nearestLng)) {
              return hospital;
            }

            const hospitalDistance = Number(
              distanceKm(
                userLocation.lat,
                userLocation.lng,
                hospitalLat,
                hospitalLng,
              ),
            );

            const nearestDistance = Number(
              distanceKm(
                userLocation.lat,
                userLocation.lng,
                nearestLat,
                nearestLng,
              ),
            );

            return hospitalDistance < nearestDistance ? hospital : nearest;
          }, existingMatches[0]);
        }

        setSelectedId(nearestHospital._id);

        setSearchLoading(false);

        return;
      }

      // Create a new controller for this search
      const controller = new AbortController();

      searchRequestRef.current = controller;

      // Show loading on Search button
      setSearchLoading(true);

      try {
        /*
          Send:
          - hospital name
          - user's latitude
          - user's longitude
          - selected radius

          Backend will use all four to find
          matching hospitals within the radius.
        */
        const params = new URLSearchParams({
          name: term,
          r: radius.toString(),
        });

        if (userLocation) {
          params.set("lat", userLocation.lat.toString());

          params.set("lng", userLocation.lng.toString());
        }

        console.log(
          "Hospital search:",
          term,
          "Radius:",
          radius,
          "Location:",
          userLocation,
        );

        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/hospitals/search?${params.toString()}`,
          {
            signal: controller.signal,
          },
        );

        // If this is no longer the current search, ignore the response
        if (searchRequestRef.current !== controller) {
          return;
        }

        const results = res.data;

        if (Array.isArray(results) && results.length > 0) {
          /*
            Backend returns the nearest matching
            hospital first.
          */
          const hospital = results[0];

          setHospitals((prev) => {
            const exists = prev.some((h) => h._id === hospital._id);

            return exists ? prev : [...prev, hospital];
          });

          setSelectedId(hospital._id);
        } else {
          alert(`No "${term}" hospital found within ${radius / 1000} km.`);
        }
      } catch (err) {
        // Cancelled searches should do nothing
        if (err.name === "CanceledError" || err.name === "AbortError") {
          return;
        }

        console.error("Search failed", err);

        alert("Error while searching hospital");
      } finally {
        // Only the current search is allowed to remove Loading
        if (searchRequestRef.current === controller) {
          searchRequestRef.current = null;

          setSearchLoading(false);
        }
      }
    },
    [hospitals, userLocation, radius],
  );

  // SEARCH BUTTON
  const handleSearch = () => {
    const term = search.trim();

    if (!term) {
      if (searchRequestRef.current) {
        searchRequestRef.current.abort();

        searchRequestRef.current = null;
      }

      setSearchLoading(false);

      return;
    }

    performSearch(term);
  };

  // To find the selected hospital to show InfoWindow
  const selectedHospital = Array.isArray(hospitals)
    ? hospitals.find((hospital) => hospital._id === selectedId)
    : null;

  // Focus the map when a hospital is selected/search result is selected.
  useEffect(() => {
    if (!mapRef.current || !selectedHospital) {
      return;
    }

    const lat = Number(selectedHospital.latitude);

    const lng = Number(selectedHospital.longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return;
    }

    mapRef.current.panTo({
      lat,
      lng,
    });

    mapRef.current.setZoom(16);
  }, [selectedHospital]);

  // Initially show the user's location together with all nearby hospitals.
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

    hospitals.forEach((hospital) => {
      const lat = Number(hospital.latitude);

      const lng = Number(hospital.longitude);

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        bounds.extend({
          lat,
          lng,
        });
      }
    });

    mapRef.current.fitBounds(bounds);

    hasFittedNearbyRef.current = true;
  }, [userLocation, hospitals]);

  // Reset the initial fit when the radius changes so the new nearby
  // hospitals can be shown.
  useEffect(() => {
    hasFittedNearbyRef.current = false;
  }, [radius]);

  if (loadError) return <p>Error loading map</p>;

  if (!isLoaded) return <p>Loading Map...</p>;

  // Sort hospitals by distance from the user's current location.
  const nearestHospitals =
    userLocation && Array.isArray(hospitals)
      ? [...hospitals]
          .filter(
            (hospital) =>
              Number.isFinite(Number(hospital.latitude)) &&
              Number.isFinite(Number(hospital.longitude)),
          )
          .map((hospital) => ({
            ...hospital,

            distance: Number(
              distanceKm(
                userLocation.lat,
                userLocation.lng,
                hospital.latitude,
                hospital.longitude,
              ),
            ),
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 5)
      : [];

  const handleDirections = () => {
    if (!userLocation || !selectedHospital) {
      return;
    }

    const origin = `${userLocation.lat},${userLocation.lng}`;

    const destination = `${selectedHospital.latitude},${selectedHospital.longitude}`;

    const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;

    window.open(directionsUrl, "_blank");
  };

  const renderMarkers = (clusterer) =>
    hospitals
      .filter(
        (hospital) =>
          Number.isFinite(Number(hospital.latitude)) &&
          Number.isFinite(Number(hospital.longitude)),
      )
      .map((hospital) => (
        <Marker
          key={hospital._id}
          position={{
            lat: Number(hospital.latitude),
            lng: Number(hospital.longitude),
          }}
          title={hospital.name}
          clusterer={clusterer}
          onClick={() => setSelectedId(hospital._id)}
          zIndex={selectedId === hospital._id ? 1000 : 1}
          icon={{
            url:
              selectedId === hospital._id
                ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                : "https://maps.google.com/mapfiles/ms/icons/red-dot.png",

            scaledSize: new window.google.maps.Size(
              selectedId === hospital._id ? 42 : 35,
              selectedId === hospital._id ? 42 : 35,
            ),
          }}
        />
      ));

  return (
    <div className="map-container">
      {/* Nearest hospitals */}
      {nearestHospitals.length > 0 && (
        <div
          style={{
            marginBottom: "12px",
            padding: "12px",
            background: "#fff",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <h3
            style={{
              margin: "0 0 8px",
            }}
          >
            Nearest Hospitals
          </h3>

          {nearestHospitals.map((hospital, index) => (
            <div
              key={hospital._id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                padding: "8px 0",
                borderBottom:
                  index < nearestHospitals.length - 1
                    ? "1px solid #eee"
                    : "none",
              }}
            >
              <div>
                <strong>{hospital.name}</strong>

                <div
                  style={{
                    fontSize: "13px",
                    color: "#666",
                  }}
                >
                  {hospital.distance.toFixed(1)} km away
                </div>
              </div>

              <button type="button" onClick={() => setSelectedId(hospital._id)}>
                View
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Input and Button */}
      <div className="map-search-bar">
        <input
          type="text"
          placeholder="Search hospital by name..."
          value={search}
          onChange={(e) => {
            const value = e.target.value;

            setSearch(value);

            // If user erases the search while request is running,
            // immediately cancel that request.
            if (!value.trim() && searchRequestRef.current) {
              searchRequestRef.current.abort();

              searchRequestRef.current = null;

              setSearchLoading(false);
            }
          }}
          className="map-search-input"
        />

        <button
          onClick={handleSearch}
          className="map-search-button"
          disabled={searchLoading}
        >
          {searchLoading ? "⏳ Loading..." : "🔍 Search"}
        </button>
      </div>

      {/* Radius Selector */}
      <div className="map-radius-selector">
        <label htmlFor="radius">Radius:</label>

        <select
          id="radius"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
        >
          <option value={2000}>2 km</option>

          <option value={5000}>5 km</option>

          <option value={10000}>10 km</option>

          <option value={15000}>15 km</option>

          <option value={25000}>25 km</option>

          <option value={50000}>50 km</option>

          <option value={100000}>100 km</option>
        </select>
      </div>

      {loading && (
        <p className="map-loading-text">Loading nearby hospitals...</p>
      )}

      {!loading && hospitals.length === 0 && (
        <p className="no-hospitals-warning">
          ⚠️ No hospitals found in this area. Try increasing radius or adding
          some entries.
        </p>
      )}

      <GoogleMap
        mapContainerStyle={mapSize}
        center={userLocation || defaultCenter}
        zoom={userLocation ? 13 : 12}
        onLoad={(map) => {
          mapRef.current = map;
        }}
        onUnmount={() => {
          mapRef.current = null;
        }}
      >
        {/* Hospital markers with clustering */}
        <MarkerClusterer zoomOnClick={true} maxZoom={20} averageCenter={true}>
          {(clusterer) => renderMarkers(clusterer)}
        </MarkerClusterer>

        {/* (Blue Marker) User Location Marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            title="You are here"
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              scaledSize: new window.google.maps.Size(40, 40),
            }}
          />
        )}

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
              <div>
                <h4>{selectedHospital.name}</h4>

                <p>{selectedHospital.address}</p>

                {userLocation && (
                  <p>
                    {distanceKm(
                      userLocation.lat,
                      userLocation.lng,
                      selectedHospital.latitude,
                      selectedHospital.longitude,
                    )}{" "}
                    km away
                  </p>
                )}

                {/* Availability Info */}

                <p>
                  Available Beds :{" "}
                  {selectedHospital.availableBeds !== null &&
                  selectedHospital.availableBeds !== undefined
                    ? selectedHospital.availableBeds
                    : "Data unavailable"}
                </p>

                {selectedHospital.totalBeds !== null &&
                  selectedHospital.totalBeds !== undefined && (
                    <p>Total Beds : {selectedHospital.totalBeds}</p>
                  )}

                <p>
                  Oxygen Units :{" "}
                  {selectedHospital.availableOxygen !== null &&
                  selectedHospital.availableOxygen !== undefined
                    ? selectedHospital.availableOxygen
                    : "Data unavailable"}
                </p>

                <p>
                  Ambulances :{" "}
                  {selectedHospital.ambulancesAvailable !== null &&
                  selectedHospital.ambulancesAvailable !== undefined
                    ? selectedHospital.ambulancesAvailable
                    : "Data unavailable"}
                </p>

                <p>Source : {selectedHospital.source || "Unknown"}</p>

                {/* Government Directory Information */}

                {selectedHospital.phone && (
                  <p>Phone : {selectedHospital.phone}</p>
                )}

                {selectedHospital.speciality && (
                  <p>Specialties : {selectedHospital.speciality}</p>
                )}

                {selectedHospital.emergencyServices && (
                  <p>
                    Emergency Services : {selectedHospital.emergencyServices}
                  </p>
                )}

                {selectedHospital.ambulancePhone && (
                  <p>Ambulance Phone : {selectedHospital.ambulancePhone}</p>
                )}

                {selectedHospital.website && (
                  <p>
                    Website :{" "}
                    <a
                      href={selectedHospital.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit Website
                    </a>
                  </p>
                )}

                {selectedHospital.governmentDataUpdated && (
                  <p>
                    Government Data Updated :{" "}
                    {selectedHospital.governmentDataUpdated}
                  </p>
                )}

                {userLocation && (
                  <button type="button" onClick={handleDirections}>
                    Get Directions
                  </button>
                )}

                {selectedHospital.verified && (
                  <p>✓ Government Directory Verified</p>
                )}
              </div>
            </InfoWindow>
          )}
      </GoogleMap>
    </div>
  );
}

export default HospitalMap;
