import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import hospitalAdminMiddleware from "../middleware/hospitalAdminMiddleware.js";
import superAdminMiddleware from "../middleware/superAdminMiddleware.js";

import {
  createHospitalAdminRequest,
  getPendingRequests,
  approveHospitalAdminRequest,
  rejectHospitalAdminRequest,
} from "../controllers/hospitalAdminController.js";

const router = express.Router();

// ==========================================
// HOSPITAL ADMIN REGISTRATION
// ==========================================

// Normal logged-in user submits a request
router.post(
  "/request",
  authMiddleware,
  createHospitalAdminRequest
);


// ==========================================
// SUPER ADMIN VERIFICATION
// ==========================================

// View pending requests
router.get(
  "/requests",
  authMiddleware,
  superAdminMiddleware,
  getPendingRequests
);

// Approve request
router.patch(
  "/requests/:id/approve",
  authMiddleware,
  superAdminMiddleware,
  approveHospitalAdminRequest
);

// Reject request
router.patch(
  "/requests/:id/reject",
  authMiddleware,
  superAdminMiddleware,
  rejectHospitalAdminRequest
);


export default router;