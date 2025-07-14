//Schema for Hospital
import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  phone: Number,
  latitude: Number,
  longitude: Number,

  // Params added later - 1
  type: { type: String },
  verified: { type: Boolean, default: false },
  openNow: { type: Boolean, default: false },
  reportCount: { type: Number, default: 0 },

  // Params added later - 3
  availableBeds: {
    type: Number,
    default: 0,
  },
  availableOxygen: {
    type: Number,
    default: 0,
  },

  ambulancesAvailable: {
    type: Number,
    default: 0,
  },
  lastUpdated: {
    type: Number,
    default: Date.now,
  },

  // Each hospital has a unique user id
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Params added later - 2
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point",
    },

    coordinates: {
      type: [Number], //[lng,lat]
      required: true,
      validate: {
        validator: function (val) {
          return val.length === 2;
        },
        message: "Coordinates must be [longitude, latitude]",
      },
    },
  },
});

// 🌐 Add geospatial index for MongoDB
hospitalSchema.index({ location: "2dsphere" });

const Hospital = mongoose.model("Hospital", hospitalSchema);

export default Hospital;
