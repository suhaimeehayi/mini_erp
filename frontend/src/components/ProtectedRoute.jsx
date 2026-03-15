import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, requiredPermissions = [], requireAny = false, redirectTo = "/" }) {
  const { isAuthenticated, loading, hasAllPermissions, hasAnyPermission } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Loading...</div>
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasAccess = requireAny
    ? hasAnyPermission(requiredPermissions)
    : hasAllPermissions(requiredPermissions);

  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

export default ProtectedRoute;