import mongoose from "mongoose";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";
import passport from "passport";

dotenv.config();

const router = express.Router();

/* -------------------------------------
   GOOGLE AUTH ROUTES (Passport.js)
--------------------------------------*/

//Redirect user to Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// Google redirects here after login
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    // req.user comes from our verify callback
    const token = jwt.sign(
      {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // redirect to React with token as URL param
    const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
    console.log("Google login success. req.user = ", req.user);
    console.log("Redirecting to:", `${CLIENT_URL}/oauth?token=${token}`);

    res.redirect(`${CLIENT_URL}/oauth?token=${token}`);
  }
);

// Logout route to destroy session
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect(process.env.CLIENT_URL || "http://localhost:3000");
  });
});

/* -------------------------------------
   LOCAL SIGNUP & LOGIN ROUTES
--------------------------------------*/

// simple check PING route
router.get("/ping", (req, res) => {
  console.log("Auth ping testing");
  res.send("Auth route is working");
});

//SIGNUP route
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // check if user already exist
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User Already Exists.Log in..." });
    }

    // Hash Password creation using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    //Generate JWT Token
    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
      },

      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("Local signup success. JWT payload:");
    console.log({
      id: newUser._id,
      email: newUser.email,
      name: newUser.name,
    });

    res.status(201).json({
      token,
      user: { name: newUser.name, email: newUser.email, _id: newUser._id },
    });
  } catch (err) {
    console.log("Signup error : ", err);
    res.status(500).json({ error: "Server error during signup" });
  }
});

//LOGIN route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User does not exist" });
    }

    // Compare Passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    // JWT Token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET || "defaultsecret",
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.log("Login error: ", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

export default router;
