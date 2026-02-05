// pages/dashboard/DashboardLayout.jsx
import { Outlet } from "react-router-dom";
import AppLoader from "../../components/common/AppLoader";
import DashboardHeader from "../../components/DashboardHeader";
import { useUser } from "../../context/UserContext";
import { useWorkspace } from "../../context/WorkspaceContext";

export default function DashboardLayout() {
  const { user, profileLoading } = useUser();
  const {
    workspaces,
    workspacePlan,
    activeWorkspace,
    setActiveWorkspace,
    loading,
    userAccess
  } = useWorkspace();
  const subscription = workspacePlan?.subscription;
  if (loading && profileLoading) {
    return <AppLoader visible={loading} message="Loading…" />;
  }

  return (
    <div className="min-h-screen w-full text-white px-4 mt-4">
      <DashboardHeader
        user={user}
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        setActiveWorkspace={setActiveWorkspace}
        subscription={subscription}
        userAccess={userAccess}
      />
      <Outlet />
    </div>
  );
}
