import express from "express";
import mongoose from "mongoose";
import Hospital from "../models/Hospital.js";
import {
  nearbyHospitals,
  searchHospitals,
} from "../controllers/hospitalController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import hospitalAdminMiddleware from "../middleware/hospitalAdminMiddleware.js";

// a mini app just for hospitals
const router = express.Router();

// =================== GET nearby hospitals ===================
router.get("/nearby", nearbyHospitals);
router.get("/search", searchHospitals);

// =================== GET my hospital ===================
router.get(
  "/mine",
  authMiddleware,
  hospitalAdminMiddleware,
  async (req, res) => {
    try {
      const hospital = await Hospital.findById(req.user.hospitalId);

      if (!hospital) {
        return res.status(404).json({
          error: "Hospital not found",
        });
      }

      res.json(hospital);
    } catch (err) {
      console.error("GET /api/hospitals/mine error:", err.message);
      res.status(500).json({
        error: "Server error",
      });
    }
  }
);

// =================== GET all hospitals ======================
router.get("/", async (req, res) => {
  try {
    const hospitals = await Hospital.find().sort({
      "availability.lastUpdated": -1,
    });

    res.json(hospitals);
  } catch (err) {
    console.error("GET /api/hospitals error:", err.message);
    res.status(500).json({
      error: "Server error",
    });
  }
});

// =================== GET hospital by ID ===================
router.get("/:id", async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        error: "Hospital not found",
      });
    }

    res.json(hospital);
  } catch (err) {
    console.log("Error in GET /:id", err);
    res.status(500).json({
      error: "Server error",
    });
  }
});

// =================== PATCH report a hospital ===================
router.patch("/:id/report", async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      {
        $inc: {
          reportCount: 1,
        },
      },
      {
        new: true,
      }
    );

    if (!hospital) {
      return res.status(404).json({
        error: "Hospital not found",
      });
    }

    res.json(hospital);
  } catch (err) {
    console.log("Error in PATCH /:id/report", err);

    res.status(500).json({
      error: "Server error",
    });
  }
});

// ============================================================
// HOSPITAL ADMIN ROUTES
// ============================================================

// =================== UPDATE HOSPITAL AVAILABILITY ===================

router.patch(
  "/:id/availability",
  authMiddleware,
  hospitalAdminMiddleware,
  async (req, res) => {
    try {
      const hospital = await Hospital.findById(req.params.id);

      if (!hospital) {
        return res.status(404).json({
          error: "Hospital not found",
        });
      }

      // Admin can ONLY update their own hospital
      if (
        hospital._id.toString() !==
        req.user.hospitalId.toString()
      ) {
        return res.status(403).json({
          error: "You can only update your assigned hospital",
        });
      }

      const {
        availableBeds,
        icuBeds,
        oxygenUnits,
        ventilators,
        ambulances,
        emergencyStatus,
      } = req.body;

      // Update only provided values
      if (availableBeds !== undefined) {
        hospital.availability.availableBeds =
          Number(availableBeds);
      }

      if (icuBeds !== undefined) {
        hospital.availability.icuBeds =
          Number(icuBeds);
      }

      if (oxygenUnits !== undefined) {
        hospital.availability.oxygenUnits =
          Number(oxygenUnits);
      }

      if (ventilators !== undefined) {
        hospital.availability.ventilators =
          Number(ventilators);
      }

      if (ambulances !== undefined) {
        hospital.availability.ambulances =
          Number(ambulances);
      }

      if (emergencyStatus !== undefined) {
        hospital.availability.emergencyStatus =
          emergencyStatus;
      }

      // Record who updated the availability
      hospital.availability.updatedBy = req.user._id;

      // Record when the availability was updated
      hospital.availability.lastUpdated = new Date();

      const updatedHospital = await hospital.save();

      res.json({
        message: "Hospital availability updated successfully",
        hospital: updatedHospital,
      });
    } catch (err) {
      console.error(
        "PATCH /api/hospitals/:id/availability error:",
        err.message
      );

      res.status(500).json({
        error: "Server error",
      });
    }
  }
);

// =================== DELETE hospital by ID ===================

router.delete(
  "/:id",
  authMiddleware,
  hospitalAdminMiddleware,
  async (req, res) => {
    try {
      const hospital = await Hospital.findById(req.params.id);

      if (!hospital) {
        return res.status(404).json({
          error: "Hospital not found",
        });
      }

      if (
        hospital._id.toString() !==
        req.user.hospitalId.toString()
      ) {
        return res.status(403).json({
          error: "Unauthorized",
        });
      }

      await hospital.deleteOne();

      res.json({
        message: "Hospital deleted successfully",
      });
    } catch (err) {
      console.error(
        "DELETE /api/hospitals/:id error:",
        err.message
      );

      res.status(500).json({
        error: "Server error",
      });
    }
  }
);

// =================== PATCH hospital profile ===================

router.patch(
  "/:id",
  authMiddleware,
  hospitalAdminMiddleware,
  async (req, res) => {
    try {
      const hospital = await Hospital.findById(req.params.id);

      if (!hospital) {
        return res.status(404).json({
          error: "Hospital not found",
        });
      }

      // Admin can ONLY update their assigned hospital
      if (
        hospital._id.toString() !==
        req.user.hospitalId.toString()
      ) {
        return res.status(403).json({
          error: "Unauthorized",
        });
      }

      // Static/profile fields only
      const allowedFields = [
        "name",
        "address",
        "phone",
        "website",
        "type",
        "specialities",
        "facilities",
        "totalBeds",
      ];

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          hospital[field] = req.body[field];
        }
      });

      const updated = await hospital.save();

      res.json(updated);
    } catch (err) {
      console.error(
        "PATCH /api/hospitals/:id error:",
        err.message
      );

      res.status(500).json({
        error: "Server error",
      });
    }
  }
);

// =================== PUT hospital profile ===================

router.put(
  "/:id",
  authMiddleware,
  hospitalAdminMiddleware,
  async (req, res) => {
    try {
      const hospital = await Hospital.findById(req.params.id);

      if (!hospital) {
        return res.status(404).json({
          error: "Hospital not found",
        });
      }

      // Admin can ONLY update their assigned hospital
      if (
        hospital._id.toString() !==
        req.user.hospitalId.toString()
      ) {
        return res.status(403).json({
          error: "Unauthorized",
        });
      }

      const allowedFields = [
        "name",
        "address",
        "phone",
        "website",
        "type",
        "specialities",
        "facilities",
        "totalBeds",
      ];

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          hospital[field] = req.body[field];
        }
      });

      const updated = await hospital.save();

      res.json(updated);
    } catch (err) {
      console.error(
        "PUT /api/hospitals/:id error:",
        err.message
      );

      res.status(500).json({
        error: "Server error",
      });
    }
  }
);

export default router;