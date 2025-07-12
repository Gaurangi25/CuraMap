//Schema for Hospital
import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  phone: Number,
  latitude: Number,
  longitude: Number,
  type: { type: String },
  verified: { type: Boolean, default: false },
  openNow: { type: Boolean, default: false },
  reportCount: { type: Number, default: 0 },
});

const Hospital = mongoose.model("Hospital", hospitalSchema);

export default Hospital;
