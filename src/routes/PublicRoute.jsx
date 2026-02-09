import { Navigate } from "react-router-dom";
import { PATHS } from "./paths";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { isAuthenticated, isOnboarded, isLoading } = useAuth();

  if (isLoading) return null;

  if (isAuthenticated && isOnboarded) {
    return <Navigate to={PATHS.DASHBOARD} replace />;
  }

  return children;
}