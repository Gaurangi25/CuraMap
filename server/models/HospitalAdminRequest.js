import mongoose from "mongoose";

const hospitalAdminRequestSchema = new mongoose.Schema(
  {
    // Person requesting hospital admin access
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Hospital they want to manage
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },

    // Information submitted for verification
    officialEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    designation: {
      type: String,
      required: true,
      trim: true,
    },

    verificationDocument: {
      type: String,
      default: null,
    },

    // Verification status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // Optional reason when rejected
    rejectionReason: {
      type: String,
      default: null,
    },

    // Who approved/rejected the request
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const HospitalAdminRequest = mongoose.model(
  "HospitalAdminRequest",
  hospitalAdminRequestSchema
);

export default HospitalAdminRequest;