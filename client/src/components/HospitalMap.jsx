import React, { useState, useEffect } from "react";
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

/*Haversine formula -> 
The standard way to compute the great‑circle distance between two latitude/longitude points on Earth.
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
  // const [radius, setRadius] = useState(5000);
const [radius, setRadius] = useState(10000);

  const [loading, setLoading] = useState(false);

  // User input for city or hospital search
  const [search, setSearch] = useState("");

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
    setLoading(true);
    console.log("Making API request to nearby with:", userLocation, radius);

    axios
      .get(
        `${process.env.REACT_APP_API_BASE_URL}/api/hospitals/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&r=${radius}`
      )
      .then((res) => {
        const data = res.data;
        console.log("Nearby hospitals from API:", data);
        //setHospitals(res.data);
        //console.log("Fetched Hospital ->", res.data);
        if (Array.isArray(data)) {
          setHospitals(data);
        } else {
          console.warn("⚠️ Invalid hospital data received:", data);
          setHospitals([]);
        }
      })
      .catch((err) => console.error("Failed to fetch hospitals", err))
      .finally(() => setLoading(false));
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
        }
      );
    } else {
      setUserLocation(defaultCenter);
    }
  }, []);

  if (loadError) return <p>Error loading map</p>;
  if (!isLoaded) return <p>Loading Map...</p>;

  const handleSearch = () => {
    if (!search.trim()) return;

    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/api/hospitals`)
      .then((res) => {
        const allHospitals = res.data;
        const match = allHospitals.find((hospital) =>
          hospital.name.toLowerCase().includes(search.toLowerCase())
        );

        console.log(
          "All hospitals loaded:",
          allHospitals.map((h) => h.name)
        );

        if (match) {
          setUserLocation({ lat: match.latitude, lng: match.longitude });
          setSelectedId(match._id);
        } else {
          alert("No hospital found with that name");
        }
      })
      .catch((err) => {
        console.error("Search failed", err);
        alert("Error while searching hospital");
      });
  };

  // To find the selected hospital to show InfoWindow
  const selectedHospital = Array.isArray(hospitals)
    ? hospitals.find((hospital) => hospital._id === selectedId)
    : null;

  const renderMarkers = (clusterer) =>
    hospitals.map((hospital) => (
      <Marker
        key={hospital._id}
        position={{
          lat: hospital.latitude,
          lng: hospital.longitude,
        }}
        title={hospital.name}
        clusterer={clusterer}
        onClick={() => setSelectedId(hospital._id)}
        icon={{
          url: "https://maps.google.com/mapfiles/ms/icons/hospitals.png",
          scaledSize: new window.google.maps.Size(35, 35),
        }}
      />
    ));

  return (
    <div className="map-container">
      {/* ✅ Search Input and Button */}
      <div className="map-search-bar">
        <input
          type="text"
          placeholder="Search hospital by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="map-search-input"
        />
        <button onClick={handleSearch} className="map-search-button">
          🔍 Search
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
        //mapContainerStyle → tells it how big to draw
        mapContainerStyle={mapSize}
        //center → where the map starts
        center={userLocation || defaultCenter}
        //zoom={12} → how zoomed in (1=world, 20=building)
        zoom={userLocation ? 13 : 12}
      >
        {/* Hospital markers with clustering */}
        <MarkerClusterer>
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

        {/*<Marker /> → puts a pin on the map 
        <Marker position={defaultCenter} /> */}
        {selectedHospital && (
          <InfoWindow
            position={{
              lat: selectedHospital.latitude,
              lng: selectedHospital.longitude,
            }}
            /* It removes the current selectedId Which means → no marker is active now.So the InfoWindow disappears from the map */
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
                    selectedHospital.longitude
                  )}{" "}
                  km away
                </p>
              )}

              {/* Availability Info */}
              <p>Beds : {selectedHospital.availableBeds}</p>
              <p>Oxygen Units : {selectedHospital.availableOxygen}</p>
              <p>Ambulances : {selectedHospital.ambulancesAvailable}</p>
              <p>Last Updated : {selectedHospital.lastUpdated}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

export default HospitalMap;
