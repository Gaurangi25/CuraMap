import mongoose from "mongoose";
import Hospital from "./models/Hospital.js";

const run = async () => {
  await mongoose.connect("mongodb+srv://CuraMap:CuraMap25@curamap-cluster.dpziq1v.mongodb.net/curamap?retryWrites=true&w=majority");

  const newHospital = new Hospital({
    name: "Test Hospital Lucknow",
    address: "Aliganj, Lucknow, UP",
    phone: 1234567890,
    latitude: 26.8410,
    longitude: 80.8730,
    type: "private",
    verified: true,
    location: {
      type: "Point",
      coordinates: [80.8730, 26.8410], // [lng, lat]
    },
  });

  await newHospital.save();
  console.log("Inserted test hospital");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
