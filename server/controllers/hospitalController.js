import {
  getNearbyHospitalsFromOSM,
  searchHospitalsFromOSM,
} from "../services/osmService.js";
import {
  findGovernmentHospital,
  getNearbyHospitalsFromGovernmentDirectory,
} from "../services/governmentHospitalService.js";

const haversineDistKm = (lat1, lon1, lat2, lon2) => {
  if (
    !Number.isFinite(Number(lat1)) ||
    !Number.isFinite(Number(lon1)) ||
    !Number.isFinite(Number(lat2)) ||
    !Number.isFinite(Number(lon2))
  ) {
    return Infinity;
  }
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const normalizeName = (name = "") =>
  name.toLowerCase().replace(/[^a-z0-9]/g, "");

/*
  GET /api/hospitals/nearby
 -------------------------
 Returns hospitals within a given radius (default = 10 km)
 Merges OpenStreetMap live facilities with verified Government Hospital Directory
*/

// Nearby hospital query
export const nearbyHospitals = async (req, res) => {
  const { lat, lng, r = 10000 } = req.query;

  // latitude and longitude are necessary
  if (!lat || !lng) {
    return res.status(400).json({
      msg: "Latitude and Longitude required",
    });
  }

  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);
  const searchRadius = Math.max(1000, parseInt(r, 10) || 10000);

  try {
    // 1. Fetch nearby hospitals from OSM
    let osmHospitals = [];
    try {
      osmHospitals = await getNearbyHospitalsFromOSM(
        userLat,
        userLng,
        searchRadius
      );
    } catch (osmErr) {
      console.warn(
        "OSM nearby fetch error, proceeding with government directory:",
        osmErr.message
      );
    }

    // 2. Enrich OSM hospitals with Government Directory metadata
    const enrichedOsmHospitals = (osmHospitals || []).map((hospital) => {
      const governmentHospital = findGovernmentHospital(
        hospital.name,
        hospital.latitude,
        hospital.longitude,
        hospital.address
      );

      if (!governmentHospital) {
        return hospital;
      }

      return {
        ...hospital,
        verified: true,
        source: "OpenStreetMap + Government Directory",
        phone:
          governmentHospital.phone ||
          hospital.phone ||
          null,
        website:
          governmentHospital.website ||
          hospital.website ||
          null,
        speciality:
          governmentHospital.speciality ||
          hospital.speciality ||
          null,
        totalBeds:
          governmentHospital.totalBeds ?? hospital.totalBeds ?? null,
        emergencyServices:
          governmentHospital.emergencyServices ||
          hospital.emergency ||
          null,
        ambulancePhone:
          governmentHospital.ambulancePhone ||
          null,
        governmentSource:
          "National Hospital Directory",
        governmentDataUpdated:
          governmentHospital.governmentDataUpdated || null,
      };
    });

    // 3. Merge and deduplicate OSM and Government Directory
    const combined = [...enrichedOsmHospitals];

    const addUniqueGovHospitals = (govList) => {
      for (const govH of govList) {
        const govLat = Number(govH.latitude);
        const govLng = Number(govH.longitude);
        const govNorm = normalizeName(govH.name);

        const isDuplicate = combined.some((existing) => {
          const exLat = Number(existing.latitude);
          const exLng = Number(existing.longitude);
          const exNorm = normalizeName(existing.name);

          // Same or very similar name
          if (
            govNorm &&
            exNorm &&
            (govNorm.includes(exNorm) || exNorm.includes(govNorm))
          ) {
            return true;
          }

          // Extremely close geographical location (< 350 meters)
          if (
            Number.isFinite(govLat) &&
            Number.isFinite(govLng) &&
            Number.isFinite(exLat) &&
            Number.isFinite(exLng)
          ) {
            const dist = haversineDistKm(govLat, govLng, exLat, exLng);
            if (dist < 0.35) {
              return true;
            }
          }
          return false;
        });

        if (!isDuplicate) {
          combined.push(govH);
          if (combined.length >= 10) break;
        }
      }
    };

    // Initial government directory search at requested radius
    let currentRadius = searchRadius;
    const initialGov = getNearbyHospitalsFromGovernmentDirectory(
      userLat,
      userLng,
      currentRadius
    );
    addUniqueGovHospitals(initialGov);

    // Guaranteed minimum: if fewer than 10 hospitals found, expand radius progressively until at least 10 hospitals are returned
    while (combined.length < 10 && currentRadius <= 80000) {
      currentRadius += 10000;
      const expandedGov = getNearbyHospitalsFromGovernmentDirectory(
        userLat,
        userLng,
        currentRadius
      );
      addUniqueGovHospitals(expandedGov);
    }

    // 5. Add calculated distance from user and sort ascending
    const sortedCombined = combined
      .map((h) => {
        const hLat = Number(h.latitude);
        const hLng = Number(h.longitude);
        const distance =
          Number.isFinite(hLat) && Number.isFinite(hLng)
            ? Number(haversineDistKm(userLat, userLng, hLat, hLng).toFixed(2))
            : Infinity;
        return {
          ...h,
          distance,
        };
      })
      .sort((a, b) => a.distance - b.distance);

    return res.status(200).json(sortedCombined);
  } catch (err) {
    console.error(
      "Error fetching nearby hospitals:",
      err.message
    );

    return res.status(500).json({
      msg: "Something went wrong",
      error: err.message,
    });
  }
};


// Search hospital by name
export const searchHospitals = async (req, res) => {
  const {
    name,
    lat,
    lng,
    r = 5000,
  } = req.query;

  if (!name) {
    return res.status(400).json({
      msg: "Hospital name required",
    });
  }

  try {
    const latitude = Number(lat);
    const longitude = Number(lng);
    const radius = Number(r);

    const hasUserLocation =
      Number.isFinite(latitude) &&
      Number.isFinite(longitude);

    const validRadius =
      Number.isFinite(radius) &&
      radius > 0
        ? radius
        : 5000;

    const hospitals =
      await searchHospitalsFromOSM(
        name,
        hasUserLocation
          ? latitude
          : null,
        hasUserLocation
          ? longitude
          : null,
        validRadius
      );

    return res.status(200).json(
      hospitals
    );
  } catch (err) {
    console.error(
      "Error searching hospitals:",
      err.message
    );

    return res.status(500).json({
      msg: "Something went wrong",
    });
  }
};