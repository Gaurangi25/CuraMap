import axios from "axios";

import {
  getNearbyHospitalsFromGovernmentDirectory,
  searchHospitalsFromGovernmentDirectory,
} from "./governmentHospitalService.js";

/*
  Multiple Overpass servers are used so that CuraMap
  does not depend on a single server.
*/
const OVERPASS_SERVERS = [
  "https://overpass-api.de/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://z.overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

/*
  Keep track of requests that are already running.
*/
const inFlightRequests = new Map();

/*
  Reusable Overpass request.
*/
const requestOverpass = async (query) => {
  if (inFlightRequests.has(query)) {
    console.log("Reusing existing Overpass request.");

    return inFlightRequests.get(query);
  }

  const requestPromise = (async () => {
    let lastError = null;

    for (const server of OVERPASS_SERVERS) {
      try {
        console.log("Trying Overpass server:", server);

        const response = await axios.get(server, {
          params: {
            data: query,
          },
          headers: {
            Accept: "application/json",
            "User-Agent":
              "CuraMap/1.0 (hospital discovery app)",
            Referer: "http://localhost:3000/",
          },
          timeout: 4500,
        });

        console.log(
          "Overpass response received from:",
          server,
          "| Elements:",
          response.data.elements?.length
        );

        return response;
      } catch (error) {
        lastError = error;

        console.warn(
          "Overpass server failed:",
          server,
          "|",
          error.response?.status ||
            error.code ||
            error.message
        );
      }
    }

    throw (
      lastError ||
      new Error("All Overpass servers failed")
    );
  })();

  inFlightRequests.set(query, requestPromise);

  try {
    return await requestPromise;
  } finally {
    inFlightRequests.delete(query);
  }
};

/*
  Convert OSM hospital into CuraMap hospital format.
*/
const mapOSMHospital = (hospital) => {
  const tags = hospital.tags || {};

  const latitude =
    hospital.type === "node"
      ? hospital.lat
      : hospital.center?.lat;

  const longitude =
    hospital.type === "node"
      ? hospital.lon
      : hospital.center?.lon;

  return {
    _id: `osm-${hospital.type}-${hospital.id}`,

    name:
      tags.name ||
      "Unnamed Hospital",

    address:
      tags["addr:full"] ||
      tags["addr:street"] ||
      tags["addr:district"] ||
      "Address unavailable",

    phone: tags.phone || "",

    latitude,
    longitude,

    type:
      tags.healthcare ||
      "hospital",

    availableBeds: null,
    availableOxygen: null,
    ambulancesAvailable: null,

    verified: false,
    lastUpdated: null,

    source: "OpenStreetMap",

    website:
      tags.website || "",

    emergency:
      tags.emergency || "",

    speciality:
      tags["healthcare:speciality"] ||
      "",
  };
};

/*
  Calculate distance between two coordinates.
*/
const haversineDistance = (
  lat1,
  lng1,
  lat2,
  lng2
) => {
  const R = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLng =
    ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return (
    R *
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )
  );
};

/*
  Sort hospitals by distance from user's location.
*/
const sortByDistance = (
  hospitals,
  userLat,
  userLng
) => {
  if (
    !Number.isFinite(userLat) ||
    !Number.isFinite(userLng)
  ) {
    return hospitals;
  }

  return hospitals
    .map((hospital) => {
      const latitude = Number(
        hospital.latitude
      );

      const longitude = Number(
        hospital.longitude
      );

      const distance =
        Number.isFinite(latitude) &&
        Number.isFinite(longitude)
          ? haversineDistance(
              userLat,
              userLng,
              latitude,
              longitude
            )
          : Infinity;

      return {
        ...hospital,
        distance,
      };
    })
    .sort(
      (a, b) =>
        a.distance - b.distance
    );
};

/*
  Filter hospitals according to selected radius.

  radius is in metres.
*/
const filterByRadius = (
  hospitals,
  userLat,
  userLng,
  radius
) => {
  if (
    !Number.isFinite(userLat) ||
    !Number.isFinite(userLng) ||
    !Number.isFinite(radius) ||
    radius <= 0
  ) {
    return hospitals;
  }

  const radiusKm =
    radius / 1000;

  return hospitals.filter(
    (hospital) => {
      const latitude = Number(
        hospital.latitude
      );

      const longitude = Number(
        hospital.longitude
      );

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        return false;
      }

      const distance =
        haversineDistance(
          userLat,
          userLng,
          latitude,
          longitude
        );

      return distance <= radiusKm;
    }
  );
};

/*
  Get nearby hospitals.
*/
export const getNearbyHospitalsFromOSM =
  async (
    lat,
    lng,
    radius = 10000
  ) => {
    const query = `
      [out:json][timeout:15];
      (
        nwr["amenity"="hospital"]["name"](around:${radius},${lat},${lng});
        nwr["healthcare"="hospital"]["name"](around:${radius},${lat},${lng});
        nwr["amenity"="clinic"]["name"](around:${radius},${lat},${lng});
      );
      out center tags;
    `;

    console.log(
      "OSM REQUEST STARTED:",
      lat,
      lng,
      radius
    );

    console.log(
      "SENDING REQUEST TO OVERPASS"
    );

    try {
      const response =
        await requestOverpass(
          query
        );

      console.log(
        "OVERPASS RESPONSE RECEIVED:",
        response.data.elements?.length
      );

      const hospitals =
        (
          response.data.elements ||
          []
        ).map(mapOSMHospital);

      /*
        Overpass itself is already asked for the
        selected radius, so these are nearby results.
      */
      return hospitals;
    } catch (error) {
      console.warn(
        "All Overpass servers failed for nearby hospitals."
      );

      console.warn(
        "Using Government Hospital Directory fallback."
      );

      const governmentHospitals =
        getNearbyHospitalsFromGovernmentDirectory(
          lat,
          lng,
          radius
        );

      console.log(
        "Government fallback hospitals:",
        governmentHospitals.length
      );

      return governmentHospitals;
    }
  };

/*
  Search hospitals by name.

  Search results are restricted to the selected
  radius when user location is available.
*/
export const searchHospitalsFromOSM =
  async (
    name,
    userLat = null,
    userLng = null,
    radius = 5000
  ) => {
    const escapedName = name
      .trim()
      .replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

    const hospitalQuery = `
      [out:json][timeout:20];
      (
        nwr["amenity"="hospital"]["name"~"${escapedName}",i];
        nwr["healthcare"="hospital"]["name"~"${escapedName}",i];
      );
      out center tags;
    `;

    console.log(
      "OSM SEARCH STARTED:",
      name
    );

    console.log(
      "SEARCH LOCATION:",
      userLat,
      userLng
    );

    console.log(
      "SEARCH RADIUS:",
      radius,
      "metres"
    );

    console.log(
      "SENDING REQUEST TO OVERPASS"
    );

    try {
      let response =
        await requestOverpass(
          hospitalQuery
        );

      let elements =
        response.data.elements || [];

      console.log(
        "OVERPASS HOSPITAL SEARCH RESPONSE RECEIVED:",
        elements.length
      );

      /*
        If the hospital-specific search finds nothing,
        try a broader name search.
      */
      if (elements.length === 0) {
        console.log(
          "Hospital-specific search returned 0. Trying fallback search..."
        );

        const fallbackQuery = `
          [out:json][timeout:20];
          nwr["name"~"${escapedName}",i];
          out center tags;
        `;

        response =
          await requestOverpass(
            fallbackQuery
          );

        elements =
          response.data.elements || [];

        console.log(
          "OVERPASS FALLBACK SEARCH RESPONSE RECEIVED:",
          elements.length
        );
      }

      let hospitals =
        elements.map(
          mapOSMHospital
        );

      /*
        IMPORTANT:
        Search now obeys the selected radius.
      */
      hospitals =
        filterByRadius(
          hospitals,
          userLat,
          userLng,
          radius
        );

      /*
        Nearest matching hospital first.
      */
      hospitals =
        sortByDistance(
          hospitals,
          userLat,
          userLng
        );

      console.log(
        "Hospitals after radius filtering:",
        hospitals.length
      );

      return hospitals;
    } catch (error) {
      console.warn(
        "All Overpass servers failed for hospital search."
      );

      console.warn(
        "Using Government Hospital Directory search fallback."
      );

      const governmentResults =
        await searchHospitalsFromGovernmentDirectory(
          name,
          userLat,
          userLng,
          radius
        );

      /*
        Government service also receives radius,
        but filter again here as a safety check.
      */
      const filteredResults =
        filterByRadius(
          governmentResults,
          userLat,
          userLng,
          radius
        );

      const sortedResults =
        sortByDistance(
          filteredResults,
          userLat,
          userLng
        );

      console.log(
        "Government search fallback results after radius filtering:",
        sortedResults.length
      );

      return sortedResults;
    }
  };