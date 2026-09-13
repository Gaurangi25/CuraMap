import HospitalAdminRequest from "../models/HospitalAdminRequest.js";
import Hospital from "../models/Hospital.js";
import User from "../models/User.js";

// ==========================================
// SUBMIT HOSPITAL ADMIN REQUEST
// ==========================================

export const createHospitalAdminRequest = async (req, res) => {
  try {
    const {
      hospitalId,
      officialEmail,
      designation,
    } = req.body;

    if (!hospitalId || !officialEmail || !designation) {
      return res.status(400).json({
        error:
          "Hospital, official email and designation are required",
      });
    }

    // Check hospital exists
    const hospital = await Hospital.findById(hospitalId);

    if (!hospital) {
      return res.status(404).json({
        error: "Hospital not found",
      });
    }

    // User cannot already be an admin
    if (req.user.role === "hospital_admin") {
      return res.status(400).json({
        error: "You are already a hospital admin",
      });
    }

    // Check for existing pending request
    const existingRequest =
      await HospitalAdminRequest.findOne({
        user: req.user._id,
        status: "pending",
      });

    if (existingRequest) {
      return res.status(400).json({
        error:
          "You already have a pending hospital admin request",
      });
    }

    // Check whether hospital already has an admin
    if (hospital.owner) {
      return res.status(400).json({
        error:
          "This hospital already has a hospital admin",
      });
    }

    const request = new HospitalAdminRequest({
      user: req.user._id,
      hospital: hospital._id,
      officialEmail,
      designation,
      status: "pending",
    });

    await request.save();

    res.status(201).json({
      message:
        "Hospital admin request submitted successfully",
      request,
    });
  } catch (err) {
    console.error(
      "Create hospital admin request error:",
      err.message
    );

    res.status(500).json({
      error: "Server error",
    });
  }
};


// ==========================================
// GET PENDING REQUESTS
// ==========================================

export const getPendingRequests = async (req, res) => {
  try {
    const requests =
      await HospitalAdminRequest.find({
        status: "pending",
      })
        .populate("user", "name email")
        .populate("hospital", "name address");

    res.json(requests);
  } catch (err) {
    console.error(
      "Get pending requests error:",
      err.message
    );

    res.status(500).json({
      error: "Server error",
    });
  }
};


// ==========================================
// APPROVE HOSPITAL ADMIN REQUEST
// ==========================================

export const approveHospitalAdminRequest = async (
  req,
  res
) => {
  try {
    const request =
      await HospitalAdminRequest.findById(
        req.params.id
      );

    if (!request) {
      return res.status(404).json({
        error: "Request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        error: "Request has already been reviewed",
      });
    }

    const user = await User.findById(request.user);
    const hospital = await Hospital.findById(
      request.hospital
    );

    if (!user || !hospital) {
      return res.status(404).json({
        error: "User or hospital not found",
      });
    }

    // Hospital can have only one admin
    if (hospital.owner) {
      return res.status(400).json({
        error:
          "This hospital already has a hospital admin",
      });
    }

    // =====================================
    // MAKE USER A HOSPITAL ADMIN
    // =====================================

    user.role = "hospital_admin";
    user.hospitalId = hospital._id;

    await user.save();

    // =====================================
    // LINK ADMIN TO HOSPITAL
    // =====================================

    hospital.owner = user._id;
    hospital.verified = true;

    await hospital.save();

    // =====================================
    // UPDATE REQUEST
    // =====================================

    request.status = "approved";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();

    await request.save();

    res.json({
      message:
        "Hospital admin approved successfully",

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hospitalId: user.hospitalId,
      },

      hospital: {
        _id: hospital._id,
        name: hospital.name,
      },
    });
  } catch (err) {
    console.error(
      "Approve hospital admin error:",
      err.message
    );

    res.status(500).json({
      error: "Server error",
    });
  }
};


// ==========================================
// REJECT HOSPITAL ADMIN REQUEST
// ==========================================

export const rejectHospitalAdminRequest = async (
  req,
  res
) => {
  try {
    const { reason } = req.body;

    const request =
      await HospitalAdminRequest.findById(
        req.params.id
      );

    if (!request) {
      return res.status(404).json({
        error: "Request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        error: "Request has already been reviewed",
      });
    }

    request.status = "rejected";

    request.rejectionReason =
      reason || "Verification request rejected";

    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();

    await request.save();

    res.json({
      message:
        "Hospital admin request rejected",
    });
  } catch (err) {
    console.error(
      "Reject hospital admin error:",
      err.message
    );

    res.status(500).json({
      error: "Server error",
    });
  }
};