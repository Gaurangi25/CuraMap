import Hospital from "../models/Hospital.js";

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
    // Build a geospatial query using MongoDB $near
    const hospitals = await Hospital.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [
              parseFloat(lng), // longitude first
              parseFloat(lat), // latitude second
            ],
          },

          $maxDistance: parseInt(r), //in metres
        },
      },
    });

    // resulting hospital array
    return res.status(200).json(hospitals);
  } catch (err) {
    console.error("Error fetching nearby hospitals:", err);
    return res.status(500).json({ msg: "Something went wrong", error: err });
  }
};
