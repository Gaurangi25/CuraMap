import express from "express";
import mongoose from "mongoose";
import Hospital from "../models/Hospital.js";

// a mini app just for hospitals

const router = express.Router();

// GET all hospitals
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

// POST a new hospital
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

export default router;
