//Schema for Hospital
import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  phone: String,
  latitude: String,
  longitude: String,
  verified: { type: Boolean, default: false },
});

const Hospital = mongoose.model("Hospital", hospitalSchema);

export default Hospital;
