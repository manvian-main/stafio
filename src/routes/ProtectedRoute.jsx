import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Redirects to the appropriate login page when there is no active session.
 * `loginPath` lets admin vs employee routes send the user to their own login.
 */
export default function ProtectedRoute({ children, loginPath = "/" }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  return children;
}
