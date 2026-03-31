import { useEffect, useMemo, useState } from "react";
import MembersLayout from "./MembersLayout";
import InviteMembersLayout from "./InviteMembersLayout";
import { useWorkspace } from "../../../../context/WorkspaceContext";

export default function WorkspaceMembersPage({ activeWorkspace }) {
  const [view, setView] = useState("members");
  const [loading, setLoading] = useState(true);
  const { fetchWorkspaceUsers, workspaceUsers, workspacePlan, ownerWorkspace, ownerWorkspacePlan } = useWorkspace();
  
    const data = useMemo(() => {
      return (workspaceUsers?.permissions || []).map((perm) => ({
        id: perm._id,
        name: perm.name || null,
        email: perm.email,
        role:
          perm.permissionType === "owner"
            ? "Owner"
            : perm.permissionType === "member"
            ? "Team member"
            : "Collaborator",
        pending: !perm.name,
      }));
    }, [workspaceUsers?.permissions]);


  const teamCount = data.filter(
    (d) => d.role === "Team member"
  ).length;

  const maxUsers = workspacePlan?.subscription?.maxUsers ?? 1;

  useEffect(() => {
    handleFetchUsers();
  }, []);

  const handleFetchUsers = async () => {
    setLoading(true);
    try {
      fetchWorkspaceUsers(activeWorkspace._id);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.error(e);
    }
  };

  if (loading) {
    return <div>loading</div>
  }

  return (
    <>
      {view === "members" && (
        <MembersLayout onInvite={() => setView("invite")} workspacePlan={workspacePlan} fetchWorkspaceUsers={handleFetchUsers} workspaceUsers={workspaceUsers} ownerWorkspace={ownerWorkspace}/>
      )}

      {view === "invite" && (
        <InviteMembersLayout onBack={() => setView("members")} teamCount={teamCount} maxUsers={maxUsers} ownerWorkspacePlan={ownerWorkspacePlan} workspacePlan={workspacePlan} fetchWorkspaceUsers={handleFetchUsers} ownerWorkspace={ownerWorkspace}/>
      )}
    </>
  );
}
