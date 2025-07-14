// checkNearby.js
import mongoose from "mongoose";
import Hospital from "./models/Hospital.js"; // adjust if path is different

const run = async () => {
  // Connect to MongoDB Atlas
  await mongoose.connect("mongodb+srv://CuraMap:CuraMap25@curamap-cluster.dpziq1v.mongodb.net/curamap?retryWrites=true&w=majority");

  // Perform nearby hospital query
  const nearby = await Hospital.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [80.8727856, 26.8402359], // [lng, lat]
        },
        $maxDistance: 5000, // in metres
      },
    },
  });

  console.log("Nearby hospitals:", nearby);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
