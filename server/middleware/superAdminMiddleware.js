const superAdminMiddleware = (req, res, next) => {
  // User must already be authenticated
  // by authMiddleware.

  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
    });
  }

  // Only super admins can approve/reject requests
  if (req.user.role !== "super_admin") {
    return res.status(403).json({
      error: "Super admin access required",
    });
  }

  next();
};

export default superAdminMiddleware;