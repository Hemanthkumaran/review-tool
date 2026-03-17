import { useState, useRef, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import "./InviteMembersLayout.css";
import { inviteUserToWorkspace } from "../../../../services/api";
import { showSuccessToast } from "../../../../helpers/showToast";

const ROLES = ["Collaborator", "Team member"];

export default function InviteMembersLayout({ onBack = () => {}, ownerWorkspace, fetchWorkspaceUsers }) {
  const [emails, setEmails] = useState([]);
  const [value, setValue] = useState("");
  const [role, setRole] = useState("Collaborator");
  const [open, setOpen] = useState(false);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const commitEmail = () => {
    const email = value.trim().toLowerCase();
    if (!email || !isValidEmail(email) || emails.includes(email)) return;
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

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleInvite() {
    const data = {
      emails,
      "permissionType": role == "Team member" ? "member" : role.toLowerCase()
    }
    inviteUserToWorkspace(ownerWorkspace._id, data)
    .then(res => {
      setEmails([]);
      setValue("");
      fetchWorkspaceUsers(ownerWorkspace._id);
      showSuccessToast("The invitation was sent to the user");
    })
    .catch(err => {
      console.log(err.response.data.error)
    })
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

        {/* <button className="close-btn" onClick={onBack}>
          <X size={18} />
        </button> */}
      </div>

      {/* Invite as */}
      <div className="invite-row" ref={dropdownRef}>
        <label>Invite as:</label>
          <button
            className={`role-dropdown ${open ? "open" : ""}`}
            onClick={() => setOpen((o) => !o)}
          >
            {role}
            <ChevronDown size={16} />
          </button>
        {open && (
          <div className="role-menu">
            {ROLES.map((r) => (
              <button
                key={r}
                className={`role-item ${r === role ? "active" : ""}`}
                onClick={() => {
                  setRole(r);
                  setOpen(false);
                }}
              >
                {r}
              </button>
            ))}
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
                setEmails((prev) => prev.filter((e) => e !== email))
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
          placeholder={emails.length ? "" : "Enter email address"}
        />
      </div>

      {/* Actions */}
      <div className="invite-actions">
        <button className="cancel-btn" onClick={onBack}>
          Cancel
        </button>

        <button className="invite-btn" disabled={!emails.length} onClick={handleInvite}>
          Invite
        </button>
      </div>
    </div>
  );
}
