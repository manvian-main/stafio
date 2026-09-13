import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Like ProtectedRoute, but also requires the session's role to be one of
 * `allow`. An authenticated user with the wrong role is sent to
 * `redirectTo` (their own dashboard) instead of the login page.
 */
export default function RoleRoute({ children, allow, loginPath = "/", redirectTo = "/" }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (!allow.includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
