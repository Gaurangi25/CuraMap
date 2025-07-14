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
const libraries = ["marker"];

function HospitalMap() {
  const [hospitals, setHospitals] = useState([]);

  // To show active markers -> the one that's clicked
  const [selectedId, setSelectedId] = useState(null);

  // To store the user's current location (latitude & longitude)
  const [userLocation, setUserLocation] = useState(null);

  //load Google Maps API
  const { isLoaded } = useJsApiLoader({
    // secret API key from .env.local
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  //Fetch hospital data from backend API
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/hospitals")
      .then((res) => {
        setHospitals(res.data);
        //console.log("Fetched Hospital ->", res.data);
      })
      .catch((err) => console.error("Failed to fetch hospitals", err));
  }, []);

  // get user's current location
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
          console.warn("Geolocation access denied or unavailable");
        }
      );
    }
  }, []);

  if (!isLoaded) {
    return <p>Loading Map...</p>;
  }

  // To find the selected hospital to show InfoWindow
  const selectedHospital = hospitals.find(
    (hospital) => hospital._id === selectedId
  );

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
            <h4 style={{ margin: 0 }}>{selectedHospital.name}</h4>
            <p style={{ margin: 0, fontSize: "0.85rem" }}>
              {selectedHospital.address}
            </p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

export default HospitalMap;
