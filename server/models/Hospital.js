// Schema for Hospital
import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema(
  {
    // =========================
    // BASIC HOSPITAL INFORMATION
    // =========================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
    },

    website: {
      type: String,
    },

    type: {
      type: String,
      enum: ["general", "specialized", "clinic"],
      required: true,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    openNow: {
      type: Boolean,
      default: false,
    },

    reportCount: {
      type: Number,
      default: 0,
    },

    // =========================
    // HOSPITAL INFORMATION
    // =========================

    specialities: {
      type: String,
      default: "",
    },

    facilities: {
      type: String,
      default: "",
    },

    // Total bed capacity from hospital/government data
    totalBeds: {
      type: Number,
      default: null,
    },

    // =========================
    // CURRENT AVAILABILITY
    // Updated by Hospital Admin
    // =========================

    availability: {
      availableBeds: {
        type: Number,
        default: null,
      },

      icuBeds: {
        type: Number,
        default: null,
      },

      oxygenUnits: {
        type: Number,
        default: null,
      },

      ventilators: {
        type: Number,
        default: null,
      },

      ambulances: {
        type: Number,
        default: null,
      },

      emergencyStatus: {
        type: String,
        enum: ["Available", "Limited", "Unavailable"],
        default: "Available",
      },

      lastUpdated: {
        type: Date,
        default: null,
      },

      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    },

    // =========================
    // OWNERSHIP
    // =========================

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // =========================
    // LOCATION
    // =========================

    latitude: {
      type: Number,
    },

    longitude: {
      type: Number,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        validate: {
          validator: function (val) {
            return val.length === 2;
          },
          message: "Coordinates must be [longitude, latitude]",
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

// 🌐 Geospatial index for MongoDB
hospitalSchema.index({ location: "2dsphere" });

const Hospital = mongoose.model("Hospital", hospitalSchema);

export default Hospital;