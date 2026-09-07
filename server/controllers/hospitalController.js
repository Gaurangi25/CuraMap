import Hospital from "../models/Hospital.js";
import {
  getNearbyHospitalsFromOSM,
  searchHospitalsFromOSM,
} from "../services/osmService.js";
import { findGovernmentHospital } from "../services/governmentHospitalService.js";
/*
  GET /api/hospitals/nearby
 -------------------------
 Returns hospitals within a given radius (default = 5 km)
 Query params:
   lat  – required – user’s latitude
   lng  – required – user’s longitude
   r    – optional – radius in metres (defaults to 5000 m)

 Example:
   /api/hospitals/nearby?lat=28.6&lng=77.2&r=8000
*/

// Nearby hospital query
export const nearbyHospitals = async (req, res) => {
  const { lat, lng, r = 5000 } = req.query;

  // latitude and longitudes are necessary
  if (!lat || !lng) {
    return res.status(400).json({ msg: "Latitude and Longitude required" });
  }

  try {
    // Fetch nearby hospitals from OSM
    const osmHospitals = await getNearbyHospitalsFromOSM(
      parseFloat(lat),
      parseFloat(lng),
      parseInt(r),
    );

    const enrichedHospitals = osmHospitals.map((hospital) => {
      const governmentHospital = findGovernmentHospital(
        hospital.name,
        hospital.latitude,
        hospital.longitude,
        hospital.address,
      );

      if (!governmentHospital) {
        return hospital;
      }

      return {
        ...hospital,

        verified: true,
        source: "OpenStreetMap + Government Directory",

        phone:
          governmentHospital.Telephone ||
          governmentHospital.Mobile_Number ||
          hospital.phone,

        website:
          governmentHospital.Website !== "0"
            ? governmentHospital.Website
            : hospital.website,

        speciality:
          governmentHospital.Specialties !== "0"
            ? governmentHospital.Specialties
            : hospital.speciality,

        totalBeds:
          governmentHospital.Total_Num_Beds !== "0"
            ? Number(governmentHospital.Total_Num_Beds)
            : null,

        emergencyServices:
          governmentHospital.Emergency_Services !== "0"
            ? governmentHospital.Emergency_Services
            : null,

        ambulancePhone:
          governmentHospital.Ambulance_Phone_No !== "0"
            ? governmentHospital.Ambulance_Phone_No
            : null,

        governmentSource: "National Hospital Directory",
        governmentDataUpdated: "2026-08-11",
      };
    });

    return res.status(200).json(enrichedHospitals);
  } catch (err) {
    console.error("Error fetching nearby hospitals:", err.message);
    return res.status(500).json({ msg: "Something went wrong", error: err });
  }
};

export const searchHospitals = async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ msg: "Hospital name required" });
  }

  try {
    const hospitals = await searchHospitalsFromOSM(name);
    return res.status(200).json(hospitals);
  } catch (err) {
    console.error("Error searching hospitals:", err.message);
    return res.status(500).json({ msg: "Something went wrong" });
  }
};
