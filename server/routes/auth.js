import mongoose from "mongoose";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// simple check PING route
router.get("/ping", (req, res) => {
  console.log("Auth ping testing");
  res.send("Auth route is working");
});

//SIGNUP route
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    //check if user already exist
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User Already Exists" });
    }

    // Hash Password creation using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Signup Successful" });
  } catch (err) {
    console.log("Signup error : ", err);
    res.status(500).json({ error: "Server error during signup" });
  }
});

//LOGIN route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    // JWT Token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "defaultsecret",
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: { name: user.name, email: user.email },
    });
  } catch (err) {
    console.log("Login error: ", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

export default router;
