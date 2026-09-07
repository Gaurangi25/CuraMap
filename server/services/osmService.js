import axios from "axios";

export const getNearbyHospitalsFromOSM = async (
  lat,
  lng,
  radius = 5000
) => {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"]["name"](around:${radius},${lat},${lng});
      way["amenity"="hospital"]["name"](around:${radius},${lat},${lng});
    );
    out center;
  `;

  console.log("OSM REQUEST STARTED:", lat, lng, radius);
  console.log("SENDING REQUEST TO OVERPASS");

  const response = await axios.get(
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    {
      params: {
        data: query,
      },
      headers: {
        Accept: "application/json",
        "User-Agent": "CuraMap/1.0 (hospital discovery app)",
        Referer: "http://localhost:3000/",
      },
    }
  );

  console.log(
    "OVERPASS RESPONSE RECEIVED:",
    response.data.elements?.length
  );

  // Convert OSM data into the format your existing frontend expects
  const hospitals = response.data.elements.map((hospital) => {
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
      name: tags.name || "Unnamed Hospital",
      address:
        tags["addr:full"] ||
        tags["addr:street"] ||
        tags["addr:district"] ||
        "Address unavailable",
      phone: tags.phone || "",
      latitude,
      longitude,
      type: tags.healthcare || "hospital",

      // OSM does not provide these availability values
      availableBeds: null,
      availableOxygen: null,
      ambulancesAvailable: null,

      verified: false,
      lastUpdated: null,

      // Additional OSM information
      source: "OpenStreetMap",
      website: tags.website || "",
      emergency: tags.emergency || "",
      speciality: tags["healthcare:speciality"] || "",
    };
  });

  return hospitals;
};

export const searchHospitalsFromOSM = async (name) => {
  /*
    Escape special regex characters.

    Example:
    "Fortis Hospital (Noida)"
    should not break the Overpass regex.
  */
  const escapedName = name
    .trim()
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  /*
    First search specifically for hospitals.

    This is much more relevant than searching every
    OSM object with a matching name.
  */
  const hospitalQuery = `
    [out:json][timeout:20];
    (
      nwr["amenity"="hospital"]["name"~"${escapedName}",i];
      nwr["healthcare"="hospital"]["name"~"${escapedName}",i];
    );
    out center tags;
  `;

  console.log("OSM SEARCH STARTED:", name);
  console.log("SENDING SEARCH REQUEST TO OVERPASS");

  let response = await axios.get(
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    {
      params: {
        data: hospitalQuery,
      },
      headers: {
        Accept: "application/json",
        "User-Agent": "CuraMap/1.0 (hospital discovery app)",
        Referer: "http://localhost:3000/",
      },
    }
  );

  let elements = response.data.elements || [];

  console.log(
    "OVERPASS HOSPITAL SEARCH RESPONSE RECEIVED:",
    elements.length
  );

  /*
    Fallback:

    If the hospital-specific query returns nothing,
    perform the original broader name search.

    This keeps your existing search behaviour as a fallback.
  */
  if (elements.length === 0) {
    console.log("Hospital-specific search returned 0. Trying fallback search...");

    const fallbackQuery = `
      [out:json][timeout:20];
      nwr["name"~"${escapedName}",i];
      out center tags;
    `;

    response = await axios.get(
      "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
      {
        params: {
          data: fallbackQuery,
        },
        headers: {
          Accept: "application/json",
          "User-Agent": "CuraMap/1.0 (hospital discovery app)",
          Referer: "http://localhost:3000/",
        },
      }
    );

    elements = response.data.elements || [];

    console.log(
      "OVERPASS FALLBACK SEARCH RESPONSE RECEIVED:",
      elements.length
    );
  }

  return elements.map((hospital) => {
    const tags = hospital.tags || {};

    return {
      _id: `osm-${hospital.type}-${hospital.id}`,
      name: tags.name || "Unnamed Hospital",
      address:
        tags["addr:full"] ||
        tags["addr:street"] ||
        tags["addr:district"] ||
        "Address unavailable",
      phone: tags.phone || "",
      latitude:
        hospital.type === "node"
          ? hospital.lat
          : hospital.center?.lat,
      longitude:
        hospital.type === "node"
          ? hospital.lon
          : hospital.center?.lon,
      type: tags.healthcare || "hospital",

      availableBeds: null,
      availableOxygen: null,
      ambulancesAvailable: null,

      verified: false,
      lastUpdated: null,

      source: "OpenStreetMap",
      website: tags.website || "",
      emergency: tags.emergency || "",
      speciality: tags["healthcare:speciality"] || "",
    };
  });
};