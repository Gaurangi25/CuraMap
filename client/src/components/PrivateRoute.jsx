import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/*
  Examples:

  <PrivateRoute>
    <Dashboard />
  </PrivateRoute>

  <PrivateRoute allowedRoles={["hospital_admin"]}>
    <HospitalAdminDashboard />
  </PrivateRoute>

  <PrivateRoute allowedRoles={["super_admin"]}>
    <SuperAdminDashboard />
  </PrivateRoute>
*/

function PrivateRoute({ children, allowedRoles }) {
  const { token, user, loading } = useAuth();

  // Don't render anything while authentication is being checked
  if (loading) {
    return <p>Checking authentication...</p>;
  }

  // User is not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required, check the user's role
  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PrivateRoute;