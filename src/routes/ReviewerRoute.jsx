import { WorkspaceProvider } from "../context/WorkspaceContext";

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
