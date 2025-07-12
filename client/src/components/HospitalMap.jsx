import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";

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

  // To show active markers -> the one that's clicked
  const [selectedId, setSelectedId] = useState(null);

  //load Google Maps API
  const { isLoaded } = useJsApiLoader({
    // secret API key from .env.local
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/hospitals")
      .then((res) => {
        setHospitals(res.data);
        console.log("Fetched Hospital ->", res.data);
      })
      .catch((err) => console.error("Failed to fetch hospitals", err));
  }, []);

  if (!isLoaded) {
    return <p>Loading Map...</p>;
  }

  const selectedHospital = hospitals.find(
    (hospital) => hospital._id === selectedId
  );

  return (
    <GoogleMap
      //mapContainerStyle → tells it how big to draw
      mapContainerStyle={mapSize}
      //center → where the map starts
      center={defaultCenter}
      //zoom={12} → how zoomed in (1=world, 20=building)
      zoom={12}
    >
      {hospitals.map((hospital) => (
        <Marker
          key={hospital._id}
          position={{
            lat: hospital.latitude,
            lng: hospital.longitude,
          }}
          title={hospital.name}
          onClick={() => setSelectedId(hospital._id)}
        />
      ))}

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
