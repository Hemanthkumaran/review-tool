import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import "./InviteMembersLayout.css";
import { inviteUserToWorkspace } from "../../../services/api";
import { getApiErrorMessage, showErrorToast, showSuccessToast } from "../../../helpers/showToast";
import { LockIcon } from "../../../assets/svgs/SvgComponents";

export default function InviteMembersLayout({
  teamCount,
  maxUsers,
  onBack = () => {},
  ownerWorkspace,
  fetchWorkspaceUsers,
  ownerWorkspacePlan
}) {
  const [emails, setEmails] = useState([]);
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("Team member");
  const [roles, setRoles] = useState([]);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const activePlan = ownerWorkspacePlan?.subscription?.activePlan;
  const availableTeamSlots = Math.max(maxUsers - teamCount, 0);
  const remainingSlots = Math.max(availableTeamSlots - emails.length, 0);

  /* ---------------------------------------
   * PLAN LOGIC (single source of truth)
   * ------------------------------------- */
  useEffect(() => {
    if (!activePlan) return;

    if (activePlan === "team_plus") {
      setRoles(["Team member", "Collaborator"]);
      setRole("Collaborator");
    } else if (activePlan === "team") {
      setRoles(["Team member", "Collaborator"]); // ✅ include both
      setRole("Team member");
    } else {
      setRoles([]);
    }
  }, [activePlan]);

  /* ---------------------------------------
   * Close dropdown on outside click
   * ------------------------------------- */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ---------------------------------------
   * Email logic
   * ------------------------------------- */
  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const commitEmail = () => {
    const email = value.trim().toLowerCase();
    if (!email || !isValidEmail(email) || emails.includes(email)) return;


    if (role === "Team member" && emails.length + 1 > availableTeamSlots) {
      showErrorToast(`Limit reached. Max ${maxUsers} team members allowed`);
      return;
    }

    setEmails((prev) => [...prev, email]);
    setValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitEmail();
    }

    if (e.key === "Backspace" && !value && emails.length) {
      setEmails((prev) => prev.slice(0, -1));
    }
  };

  /* ---------------------------------------
   * Invite logic
   * ------------------------------------- */
  function handleInvite() {

    if (role === "Team member" && emails.length > availableTeamSlots) {
      showErrorToast(`You can only invite ${remainingSlots} more team members`);
      return;
    }

    const data = {
      emails,
      permissionType:
        role === "Team member" ? "member" : role.toLowerCase(),
    };
    inviteUserToWorkspace(ownerWorkspace._id, data)
      .then(() => {
        setEmails([]);
        setValue("");
        fetchWorkspaceUsers(ownerWorkspace._id);
        showSuccessToast("The invitation was sent to the user");
      })
      .catch((err) => {
        console.error(err?.response?.data?.error);
        showErrorToast(getApiErrorMessage(err, "Failed to send invitation"));
      });
  }

  const isOverLimit =
    role === "Team member" &&
    emails.length > availableTeamSlots;

  /* ---------------------------------------
   * ❌ Freelancer → hide entire UI
   * ------------------------------------- */
if (!activePlan) {
  return null; // or loader if you want
}

  return (
    <div>
      {/* Header */}
      <div className="invite-header">
        <div>
          <div className="breadcrumb">
            <button className="breadcrumb-link" onClick={onBack}>
              Users
            </button>
            <span>/</span>
            <strong>Send an invite</strong>
          </div>

          <p className="invite-subtitle">
            Share access to your workspace and choose the role they'll have.
          </p>
        </div>
      </div>

      {/* Invite as */}
      <div className="invite-row" ref={dropdownRef}>
        <label>Invite as:</label>
<button
  className={`role-dropdown ${open ? "open" : ""} ${
    activePlan === "freelancer" ? "disabled" : ""
  }`}
  onClick={() => {
    setOpen((o) => !o);
  }}
>
  {role}
  {/* {activePlan !== "team_plus" && (
    <span className="ml-2 opacity-50">🔒</span>
  )} */}
  <ChevronDown size={16} />
</button>

        {open && (
  <div className="role-menu">
    {roles.map((r) => {
const isDisabled =
  (activePlan === "team" && r === "Collaborator") ||
  activePlan === "freelancer";

      return (
        <button
          key={r}
          style={{ color: isDisabled ? "#323232" : "#BFBFBF"}}
          className={`role-item flex items-center
            ${r === role ? "active" : ""} 
            ${isDisabled ? "disabled" : ""}
          `}
          onClick={() => {
            if (isDisabled) return; // 🔒 block selection
            setRole(r);
            setOpen(false);
          }}
        >
          <span>{r}</span>

          {/* 🔒 lock icon */}
          {isDisabled && <span style={{ marginLeft:10 }}><LockIcon/></span>}
        </button>
      );
    })}
  </div>
)}
      </div>

      <br />

      {/* Email input */}
      <div className="email-box" onClick={() => inputRef.current.focus()}>
        {emails.map((email) => (
          <div key={email} className="email-chip">
            {email}
            <button
              className="chip-remove"
              onClick={() =>
                setEmails((prev) =>
                  prev.filter((e) => e !== email)
                )
              }
            >
              ×
            </button>
          </div>
        ))}

<input
  ref={inputRef}
  className="email-input"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  onKeyDown={handleKeyDown}
  placeholder={""}
/>
      </div>

      {isOverLimit && role === "Team member" && (
        <div className="text-xs text-red-400 mt-2">
          You can only invite {remainingSlots} more user
          {remainingSlots !== 1 ? "s" : ""}
        </div>
      )}

      {/* Actions */}
      <div className="invite-actions">
        <button className="cancel-btn" onClick={onBack}>
          Cancel
        </button>

<button
  className="invite-btn"
  disabled={
    !emails.length ||
    isOverLimit
  }
  onClick={handleInvite}
>
  Invite
</button>
      </div>
    </div>
  );
}
