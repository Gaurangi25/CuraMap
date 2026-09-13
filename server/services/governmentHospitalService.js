import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.join(
  __dirname,
  "../data/hospital_directory.csv"
);

const csvContent = fs.readFileSync(
  csvPath,
  "utf-8"
);

const governmentHospitals = parse(
  csvContent,
  {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    bom: true,
  }
);

console.log(
  `Loaded ${governmentHospitals.length} hospitals from Government Hospital Directory`
);

/*
  Normalize text for matching.
*/
const normalize = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/*
  Words that are too generic to help identify a hospital.
*/
const GENERIC_TERMS = new Set([
  "hospital",
  "hospitals",
  "medical",
  "centre",
  "center",
  "clinic",
  "health",
  "healthcare",
  "institute",
  "institution",
  "trust",
  "limited",
  "ltd",
  "pvt",
  "private",
  "public",
  "general",
  "district",
  "government",
  "govt",
  "and",
  "the",
  "of",
  "for",
  "at",
]);

const getMeaningfulTokens = (value = "") =>
  normalize(value)
    .split(" ")
    .filter(
      (token) =>
        token.length >= 2 &&
        !GENERIC_TERMS.has(token)
    );

/*
  Build searchable index.
*/
const governmentHospitalIndex =
  governmentHospitals.map((hospital) => {
    const name =
      hospital.Hospital_Name || "";

    return {
      hospital,
      normalizedName: normalize(name),
      tokens: getMeaningfulTokens(name),
    };
  });

/*
  Parse coordinates from government CSV.
*/
const parseCoordinates = (value) => {
  if (!value) {
    return null;
  }

  const parts = String(value)
    .split(",")
    .map((item) => item.trim());

  if (parts.length < 2) {
    return null;
  }

  const latitude = Number(parts[0]);
  const longitude = Number(parts[1]);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  return {
    latitude,
    longitude,
  };
};

/*
  Haversine distance in kilometres.
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
  Build a useful address from government data.
*/
const buildGovernmentAddress = (
  hospital
) => {
  const parts = [
    hospital.Address_Original_First_Line,
    hospital.Location,
    hospital.Subdistrict,
    hospital.District,
    hospital.State,
    hospital.Pincode,
  ]
    .map((value) =>
      String(value || "").trim()
    )
    .filter(Boolean);

  return [
    ...new Set(parts),
  ].join(", ");
};

/*
  Convert government record into CuraMap format.
*/
const toGovernmentHospital = (
  hospital,
  coordinates = null
) => {
  const csvCoordinates =
    parseCoordinates(
      hospital.Location_Coordinates
    );

  const finalCoordinates =
    coordinates || csvCoordinates;

  return {
    _id: `gov-${hospital.Sr_No}`,

    name:
      hospital.Hospital_Name ||
      "Unnamed Hospital",

    address:
      buildGovernmentAddress(
        hospital
      ) || "Address unavailable",

    phone:
      hospital.Telephone ||
      hospital.Mobile_Number ||
      "",

    latitude:
      finalCoordinates?.latitude ??
      null,

    longitude:
      finalCoordinates?.longitude ??
      null,

    type: "hospital",

    /*
      Government directory does NOT contain
      live availability information.
    */
    availableBeds: null,
    availableOxygen: null,
    ambulancesAvailable: null,

    verified: true,

    lastUpdated:
      "2026-08-11",

    source:
      "Government Hospital Directory",

    website:
      hospital.Website || "",

    emergency:
      hospital.Emergency_Services ||
      "",

    speciality:
      (hospital.Specialties || "")
        .replace(/\s*\n\s*/g, " ")
        .replace(/\s+/g, " ")
        .trim(),

    totalBeds:
      hospital.Total_Num_Beds
        ? Number(hospital.Total_Num_Beds)
        : null,

    emergencyServices:
      hospital.Emergency_Services ||
      "",

    ambulancePhone:
      hospital.Ambulance_Phone_No ||
      "",

    governmentSource:
      "National Hospital Directory",

    governmentDataUpdated:
      "2026-08-11",
  };
};

/*
  Find the best government match for an OSM hospital.

  Government information enriches the OSM hospital,
  but does NOT replace OSM coordinates.
*/
export const findGovernmentHospital = (
  osmHospitalName,
  latitude,
  longitude,
  osmAddress = ""
) => {
  if (!osmHospitalName) {
    return null;
  }

  const osmTokens =
    getMeaningfulTokens(
      osmHospitalName
    );

  if (osmTokens.length === 0) {
    return null;
  }

  const osmAddressTokens =
    getMeaningfulTokens(
      osmAddress
    );

  let bestMatch = null;
  let bestScore = -Infinity;

  for (const entry of governmentHospitalIndex) {
    const {
      hospital,
      normalizedName,
      tokens,
    } = entry;

    if (tokens.length === 0) {
      continue;
    }

    const commonNameTokens =
      osmTokens.filter((token) =>
        tokens.includes(token)
      );

    const coverage =
      commonNameTokens.length /
      osmTokens.length;

    /*
      Avoid unrelated hospitals that only share
      a generic word.
    */
    if (
      commonNameTokens.length === 0 ||
      coverage < 0.5
    ) {
      continue;
    }

    const governmentCoordinates =
      parseCoordinates(
        hospital.Location_Coordinates
      );

    let distance = null;

    if (
      governmentCoordinates &&
      Number.isFinite(Number(latitude)) &&
      Number.isFinite(Number(longitude))
    ) {
      distance =
        haversineDistance(
          Number(latitude),
          Number(longitude),
          governmentCoordinates.latitude,
          governmentCoordinates.longitude
        );

      /*
        Same hospital should not be several kilometres
        away from its OSM location.
      */
      if (distance > 5) {
        continue;
      }
    }

    /*
      Compare address when coordinates are unavailable.
    */
    let addressMatches = 0;

    if (
      osmAddressTokens.length > 0
    ) {
      const governmentAddressTokens =
        getMeaningfulTokens(
          buildGovernmentAddress(
            hospital
          )
        );

      addressMatches =
        osmAddressTokens.filter(
          (token) =>
            governmentAddressTokens.includes(
              token
            )
        ).length;
    }

    /*
      If there is only one meaningful name token
      and no useful address/proximity confirmation,
      do not make the match.
    */
    if (
      osmTokens.length === 1 &&
      !governmentCoordinates &&
      addressMatches < 2
    ) {
      continue;
    }

    let score =
      commonNameTokens.length * 10;

    score +=
      coverage * 20;

    score +=
      addressMatches * 4;

    /*
      Prefer exact normalized names.
    */
    if (
      normalizedName ===
      normalize(osmHospitalName)
    ) {
      score += 50;
    }

    /*
      Prefer same first meaningful token.
    */
    if (
      tokens[0] &&
      osmTokens[0] &&
      tokens[0] === osmTokens[0]
    ) {
      score += 10;
    }

    /*
      Prefer geographically close matches.
    */
    if (distance !== null) {
      score += Math.max(
        0,
        20 - distance * 4
      );
    }

    if (score > bestScore) {
      bestScore = score;

      bestMatch = {
        hospital,
        distance,
      };
    }
  }

  if (!bestMatch) {
    return null;
  }

  return toGovernmentHospital(
    bestMatch.hospital
  );
};

/*
  Get government hospitals within the requested radius.

  Only records with actual government coordinates
  are included.
*/
export const getNearbyHospitalsFromGovernmentDirectory =
  (
    latitude,
    longitude,
    radius = 5000
  ) => {
    const userLat =
      Number(latitude);

    const userLng =
      Number(longitude);

    if (
      !Number.isFinite(userLat) ||
      !Number.isFinite(userLng)
    ) {
      return [];
    }

    const radiusKm =
      Number(radius) / 1000;

    const results = [];

    for (
      const hospital of governmentHospitals
    ) {
      const coordinates =
        parseCoordinates(
          hospital.Location_Coordinates
        );

      /*
        Never assume a hospital is nearby when
        its government record has no coordinates.
      */
      if (!coordinates) {
        continue;
      }

      const distance =
        haversineDistance(
          userLat,
          userLng,
          coordinates.latitude,
          coordinates.longitude
        );

      if (distance <= radiusKm) {
        results.push({
          ...toGovernmentHospital(
            hospital,
            coordinates
          ),
          distance,
        });
      }
    }

    return results.sort(
      (a, b) =>
        a.distance - b.distance
    );
  };

/*
  Cache geocoding results.
*/
const geocodeCache = new Map();

const geocodeAddress = async (
  hospitalName,
  address
) => {
  const cleanAddress =
    String(address || "").trim();

  if (!cleanAddress) {
    return null;
  }

  const cacheKey =
    `${hospitalName}|${cleanAddress}`.toLowerCase();

  if (
    geocodeCache.has(cacheKey)
  ) {
    return geocodeCache.get(
      cacheKey
    );
  }

  try {
    const response =
      await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: `${hospitalName}, ${cleanAddress}`,
            format: "json",
            limit: 1,
          },

          headers: {
            "User-Agent":
              "CuraMap/1.0 (hospital discovery app)",
          },

          timeout: 8000,
        }
      );

    const result =
      response.data?.[0];

    if (!result) {
      geocodeCache.set(
        cacheKey,
        null
      );

      return null;
    }

    const coordinates = {
      latitude: Number(
        result.lat
      ),
      longitude: Number(
        result.lon
      ),
    };

    if (
      !Number.isFinite(
        coordinates.latitude
      ) ||
      !Number.isFinite(
        coordinates.longitude
      )
    ) {
      geocodeCache.set(
        cacheKey,
        null
      );

      return null;
    }

    geocodeCache.set(
      cacheKey,
      coordinates
    );

    return coordinates;
  } catch (error) {
    console.warn(
      "Government hospital geocoding failed:",
      error.message
    );

    return null;
  }
};

/*
  Search government hospitals by name.

  IMPORTANT:
  Search results are also restricted by the
  selected radius when user location is available.
*/
export const searchHospitalsFromGovernmentDirectory =
  async (
    name,
    userLat = null,
    userLng = null,
    radius = 5000
  ) => {
    const searchText =
      normalize(name);

    const searchTokens =
      getMeaningfulTokens(name);

    if (
      !searchText ||
      searchTokens.length === 0
    ) {
      return [];
    }

    const candidates = [];

    for (
      const entry of governmentHospitalIndex
    ) {
      const {
        hospital,
        normalizedName,
        tokens,
      } = entry;

      if (tokens.length === 0) {
        continue;
      }

      const commonTokens =
        searchTokens.filter(
          (token) =>
            tokens.includes(token)
        );

      if (
        commonTokens.length === 0
      ) {
        continue;
      }

      /*
        Require at least half of the meaningful
        search words to match.
      */
      const coverage =
        commonTokens.length /
        searchTokens.length;

      if (
        searchTokens.length > 1 &&
        coverage < 0.5
      ) {
        continue;
      }

      let score = 0;

      score +=
        commonTokens.length * 20;

      score +=
        coverage * 50;

      /*
        Exact hospital-name match gets a
        strong boost.
      */
      if (
        normalizedName ===
        searchText
      ) {
        score += 100;
      }

      /*
        Prefer names that start with
        the search text.
      */
      if (
        normalizedName.startsWith(
          searchText
        )
      ) {
        score += 40;
      }

      /*
        Prefer phrase occurrence.
      */
      if (
        normalizedName.includes(
          searchText
        )
      ) {
        score += 30;
      }

      candidates.push({
        hospital,
        score,
      });
    }

    /*
      Keep enough candidates so a nearby hospital
      isn't removed just because another city's
      name score was slightly higher.
    */
    candidates.sort(
      (a, b) =>
        b.score - a.score
    );

    const selected =
      candidates.slice(0, 50);

    const results = [];

    const hasUserLocation =
      Number.isFinite(
        Number(userLat)
      ) &&
      Number.isFinite(
        Number(userLng)
      );

    const radiusKm =
      Number(radius) / 1000;

    for (
      const candidate of selected
    ) {
      const hospital =
        candidate.hospital;

      let coordinates =
        parseCoordinates(
          hospital.Location_Coordinates
        );

      /*
        If government coordinates are missing,
        try geocoding the hospital + address.
      */
      if (!coordinates) {
        coordinates =
          await geocodeAddress(
            hospital.Hospital_Name,
            buildGovernmentAddress(
              hospital
            )
          );
      }

      /*
        If we have user location, we MUST have
        coordinates to verify the radius.

        A hospital without coordinates cannot be
        safely called "within 10 km".
      */
      if (
        hasUserLocation &&
        !coordinates
      ) {
        continue;
      }

      const result =
        toGovernmentHospital(
          hospital,
          coordinates
        );

      /*
        Calculate distance and enforce radius.
      */
      if (
        hasUserLocation
      ) {
        const distance =
          haversineDistance(
            Number(userLat),
            Number(userLng),
            coordinates.latitude,
            coordinates.longitude
          );

        /*
          THIS is the important radius check.
        */
        if (
          distance > radiusKm
        ) {
          continue;
        }

        result.distance =
          distance;
      } else {
        result.distance =
          Infinity;
      }

      result.searchScore =
        candidate.score;

      results.push(result);
    }

    /*
      Nearest matching hospital first.
    */
    results.sort((a, b) => {
      if (
        a.distance !== Infinity ||
        b.distance !== Infinity
      ) {
        return (
          a.distance -
          b.distance
        );
      }

      return (
        b.searchScore -
        a.searchScore
      );
    });

    /*
      Remove internal ranking field.
    */
    return results.map(
      ({
        searchScore,
        ...hospital
      }) => hospital
    );
  };