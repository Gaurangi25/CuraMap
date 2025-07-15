import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  // Expect header:  Authorization: Bearer <token>
  const authHeader = req.header("Authorization");
  console.log("Incoming Auth Header:", authHeader);

  // Check if token exists and satrts with bearer
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ error: "No token, auth denied" });
  }

  // Extract Token
  const token = authHeader.replace("Bearer ", "").trim();
  console.log("Extracted Token:", token);

  try {
    // Verify token using secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded);

    // Attach user to request (excluding password)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ error: "User not found" });
    }

    console.log("User Authenticated:", req.user.email);
    // Allow request to proceed
    next();
  } catch (err) {
    console.error("JWT verify error:", err.message);
    res.status(401).json({ error: "Token invalid" });
  }
};

export default authMiddleware;
