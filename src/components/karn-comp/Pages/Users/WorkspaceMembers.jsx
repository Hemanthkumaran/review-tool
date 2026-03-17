import { useEffect, useState } from "react";
import MembersLayout from "./MembersLayout";
import InviteMembersLayout from "./InviteMembersLayout";
import { useWorkspace } from "../../../../context/WorkspaceContext";

export default function WorkspaceMembersPage({ activeWorkspace }) {
  const [view, setView] = useState("members");
  const [loading, setLoading] = useState(true);
  const { fetchWorkspaceUsers, workspaceUsers, workspacePlan } = useWorkspace();

  useEffect(() => {
    handleFetchUsers();
  }, []);

  const handleFetchUsers = async () => {
    console.log('111');
    
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
        <MembersLayout onInvite={() => setView("invite")} workspacePlan={workspacePlan} fetchWorkspaceUsers={handleFetchUsers} workspaceUsers={workspaceUsers} activeWorkspace={activeWorkspace}/>
      )}

      {view === "invite" && (
        <InviteMembersLayout onBack={() => setView("members")} workspacePlan={workspacePlan} fetchWorkspaceUsers={handleFetchUsers} activeWorkspace={activeWorkspace}/>
      )}
    </>
  );
}
