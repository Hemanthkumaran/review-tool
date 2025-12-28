import { useEffect, useState } from "react";
import MembersLayout from "./MembersLayout";
import InviteMembersLayout from "./InviteMembersLayout";
import { useWorkspace } from "../../../../context/WorkspaceContext";

export default function WorkspaceMembersPage({ activeWorkspace }) {
  const [view, setView] = useState("members");
  const [loading, setLoading] = useState(true);
  const { fetchWorkspaceUsers, workspaceUsers } = useWorkspace();

  useEffect(() => {
    handleFetchUsers();
  }, []);

  const handleFetchUsers = async () => {
    setLoading(true);
    try {
      fetchWorkspaceUsers();
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
        <MembersLayout onInvite={() => setView("invite")} fetchWorkspaceUsers={handleFetchUsers} workspaceUsers={workspaceUsers} activeWorkspace={activeWorkspace}/>
      )}

      {view === "invite" && (
        <InviteMembersLayout onBack={() => setView("members")} activeWorkspace={activeWorkspace}/>
      )}
    </>
  );
}
