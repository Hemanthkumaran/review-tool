import { useState } from "react";
import MembersLayout from "./MembersLayout";
import InviteMembersLayout from "./InviteMembersLayout";

export default function WorkspaceMembersPage() {
  const [view, setView] = useState("members");

  return (
    <>
      {view === "members" && (
        <MembersLayout onInvite={() => setView("invite")} />
      )}

      {view === "invite" && (
        <InviteMembersLayout onBack={() => setView("members")} />
      )}
    </>
  );
}
