import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "SUPER_ADMIN") {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === "HOTEL_ADMIN") {
      return <Navigate to="/hotel-admin" replace />;
    }
    if (user.role === "TRIP_MANAGER") {
      return <Navigate to="/trip-manager" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}
