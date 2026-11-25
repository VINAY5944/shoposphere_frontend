
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

import Loader from "./Loader";

function ProtectedRoute({
  allowedRoles = [],
  requiredPermissions = [],
}) {
  const { user, isAuthenticated, loading } = useSelector(
    (state) => state.auth
  );

  // Wait while authentication is being checked
  if (loading) {
    return <Loader text="Checking authentication..." />;
  }

  // Redirect unauthenticated users
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const userRoles = user.roles || [];
  const userPermissions = user.permissions || [];

  // User must have at least one allowed role
  const hasRole =
    allowedRoles.length === 0 ||
    allowedRoles.some((role) => userRoles.includes(role));

  // User must have every required permission
  const hasPermissions = requiredPermissions.every(
    (permission) => userPermissions.includes(permission)
  );

  if (!hasRole || !hasPermissions) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
