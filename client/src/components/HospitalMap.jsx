import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

//Fetch hospitals from /api/hospitals → map through them → place <Marker /> for each
import axios from "axios";

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

function HospitalMap() {
  const [hospitals, setHospitals] = useState([]);

  //load Google Maps API
  const { isLoaded } = useJsApiLoader({
    // secret API key from .env.local
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/hospitals")
      .then((res) => setHospitals(res.data))
      .catch((err) => console.error("Failed to fetch hospitals", err));
  }, []);

  if (!isLoaded) {
    return <p>Loading Map...</p>;
  }

  return (
    <GoogleMap
      //mapContainerStyle → tells it how big to draw
      mapContainerStyle={mapSize}
      //center → where the map starts
      center={defaultCenter}
      //zoom={12} → how zoomed in (1=world, 20=building)
      zoom={12}
    >
      {hospitals.map((hospital, index) => (
        <Marker
          key={index}
          position={{
            lat: hospital.latitude,
            lng: hospital.longitude,
          }}
          title={hospital.name}
        />
      ))}

      {/*<Marker /> → puts a pin on the map 
      <Marker position={defaultCenter} /> */}
    </GoogleMap>
  );
}

export default HospitalMap;
