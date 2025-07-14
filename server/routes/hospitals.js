import express from "express";
import mongoose from "mongoose";
import Hospital from "../models/Hospital.js";
import { nearbyHospitals } from "../controllers/hospitalController.js";
import authMiddleware from "../middleware/authMiddleware.js";

// a mini app just for hospitals
const router = express.Router();

// =================== GET nearby hospitals ===================
router.get("/nearby", nearbyHospitals);

// =================== GET all hospitals ======================
router.get("/", async (req, res) => {
  //   console.log("GET /api/hospitals is working");
  //   res.send("Hospital GET route is working");

  try {
    const hospitals = await Hospital.find().sort({ lastUpdated: -1 });
    res.json(hospitals);
  } catch (err) {
    console.error("GET /api/hospitals error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// =================== GET hospital by ID ===================
router.get("/:id", async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ error: "Hospital not found" });
    }
    res.json(hospital);
  } catch (err) {
    console.log("Error in GET /:id", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =================== GET my hospitals (auth only) ===================
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const hospitals = await Hospital.find({ owner: req.user.id });
    res.json(hospitals);
  } catch (err) {
    console.error("GET /api/hospitals/mine error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// =================== POST a new hospital ====================
router.post("/", authMiddleware, async (req, res) => {
  //   console.log("POST /api/hospitals");
  //   console.log(req.body);
  //   res.send("Hospital POST route working");

  try {
    const {
      name,
      address,
      phone,
      latitude,
      longitude,
      type,
      verified,
      availableBeds,
      availableOxygen,
      ambulancesAvailable,
    } = req.body;

    //Validating required fields
    if (!name || !latitude || !longitude) {
      return res.status(400).json({
        error: "Missing required fields: name,latitude, or longitude",
      });
    }

    // geolocation
    const location = {
      type: "Point",
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
    };

    // ✅ Time-based openNow (9 AM - 6 PM)
    const now = new Date();
    const hour = now.getHours();
    const openNow = hour >= 9 && hour < 18;

    //Creating new Hospital
    const newHospital = new Hospital({
      name,
      address,
      phone,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      type,
      verified: Boolean(verified),
      availableBeds: parseInt(availableBeds) || 0,
      availableOxygen: parseInt(availableOxygen) || 0,
      ambulancesAvailable: parseInt(ambulancesAvailable) || 0,
      openNow,
      location,
      owner: req.user.id,
    });

    const saved = await newHospital.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("POST /api/hospitals error:", err.message);
    res.status(400).json({ error: "Invalid hospital data" });
  }
});

// =================== PATCH report a hospital ===================
router.patch("/:id/report", async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { $inc: { reportCount: 1 } },
      { new: true }
    );

    if (!hospital) {
      return res.status(404).json({ error: "Hospital not found" });
    }

    res.json(hospital);
  } catch (err) {
    console.log("Error in PATCH /:id/report", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =================== DELETE hospital by ID ===================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ error: "Hospital not found" });
    }

    if (hospital.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await hospital.deleteOne();
    res.json({ message: "Hospital deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/hospitals/:id error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// =================== PATCH update hospital by ID ===================
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ error: "Hospital not found" });
    }

    if (hospital.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const allowedFields = [
      "name",
      "address",
      "phone",
      "latitude",
      "longitude",
      "type",
      "verified",
      "availableBeds",
      "availableOxygen",
      "ambulancesAvailable",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        hospital[field] = req.body[field];
      }
    });

    const updated = await hospital.save();
    res.json(updated);
  } catch (err) {
    console.error("PATCH /api/hospitals/:id error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
