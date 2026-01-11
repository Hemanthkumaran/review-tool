import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { WorkspaceProvider } from "../context/WorkspaceContext";
import { PATHS } from "./paths";

export default function ReviewerRoute({ children }) {
//   const { isAuthenticated, isLoading } = useAuth();

//   if (isLoading) return null;

//   if (!isAuthenticated) {
//     return <Navigate to={PATHS.ROOT} replace />;
//   }

  return (
    <WorkspaceProvider>
      {children}
    </WorkspaceProvider>
  );
}
