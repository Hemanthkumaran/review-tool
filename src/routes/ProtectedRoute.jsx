import { Navigate } from "react-router-dom";
import { PATHS } from "./paths";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("authToken");

  if (!token) {
    return <Navigate to={PATHS.ROOT} replace />;
  }

  return children;
}
