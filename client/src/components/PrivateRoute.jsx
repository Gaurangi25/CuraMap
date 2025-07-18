import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* 
In react <PrivateRoute>
            <Dashboard />
         </PrivateRoute>

         <Dashboard /> is the children
*/

function PrivateRoute({ children }) {
  const { token, loading } = useAuth(); //this gives the store JWT in token

  // Don't render anything if token check hasn't completed yet
  if (loading) {
    return <p>Checking authentication...</p>; // or a loader
  }

  if (!token) {
    return <Navigate to="/login" replace />;
    // replace means user goes to the login page...and this page is not saved in the history
  }

  // shows dashboard page on logging in
  return children;
}

export default PrivateRoute;
