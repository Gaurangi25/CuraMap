const hospitalAdminMiddleware = (req, res, next) => {
  // User must already be authenticated
  // by authMiddleware before reaching here.

  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
    });
  }

  // Only hospital admins are allowed
  if (req.user.role !== "hospital_admin") {
    return res.status(403).json({
      error: "Hospital admin access required",
    });
  }

  // Hospital admin must be linked to a hospital
  if (!req.user.hospitalId) {
    return res.status(403).json({
      error: "No hospital assigned to this admin",
    });
  }

  next();
};

export default hospitalAdminMiddleware;