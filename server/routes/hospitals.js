import express from "express";
import mongoose from "mongoose";
import Hospital from "../models/Hospital.js";
import { nearbyHospitals } from "../controllers/hospitalController.js";

// a mini app just for hospitals

const router = express.Router();

// =================== GET nearby hospitals ===================
router.get("/nearby", nearbyHospitals);

// =================== GET all hospitals ===================
router.get("/", async (req, res) => {
  //   console.log("GET /api/hospitals is working");
  //   res.send("Hospital GET route is working");

  try {
    const hospitals = await Hospital.find();
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// =================== POST a new hospital ===================
router.post("/", async (req, res) => {
  //   console.log("POST /api/hospitals");
  //   console.log(req.body);
  //   res.send("Hospital POST route working");

  try {
    const newHospital = new Hospital(req.body);
    const saved = await newHospital.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: "Invalid data" });
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

export default router;
