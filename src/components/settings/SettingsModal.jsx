import { useState } from "react";
import "./SettingsModal.css";
import Profile from "./ProfileSettings";
import WorkspaceSettings from "./WorkspaceSettings";
import WorkspaceMembersPage from "./users/WorkspaceMembers";
import Billing from "./billing/Billing";
import { Usage } from "./billing/Usage";

import profile from "../../assets/svgs/settings/profile.svg";
import workspace from "../../assets/svgs/settings/workspace.svg";
import users from "../../assets/svgs/settings/users.svg";
import usage from "../../assets/svgs/settings/usage.svg";
import billing from "../../assets/svgs/settings/billing.svg";
import Modal from "react-modal";
import close from "../../assets/svgs/close.svg";
import { constants } from "../../helpers/enum";
import { useWorkspace } from "../../context/WorkspaceContext";

const tabs = [
  { id: "profile", label: "Profile", icon: profile },
  { id: "workspace", label: "Workspace", icon: workspace },
  { id: "users", label: "Users", icon: users },
  { id: "usage", label: "Storage Management", icon: usage },
  { id: "billing", label: "Billing", icon: billing },
];

const modalStyles = {
  overlay: {
    backgroundColor: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(6px)",
    zIndex: 2000,
  },
  content: {
    inset: "50% auto auto 50%",
    transform: "translate(-50%, -50%)",
    padding: 0,
    border: "none",
    background: "transparent",
    overflow: "visible",
  },
};

export default function SettingsModal({ isOpen, onClose, activeWorkspace, activeScreen = null }) {
  const { trialUsed, userAccess } = useWorkspace();
  const [active, setActive] = useState(activeScreen || "profile");

  const shouldRenderTabs =
  userAccess === constants.OWNER && trialUsed;

  const restrictedTabs = ["users", "usage", "billing"];

  const filteredTabs = tabs.filter((tab) => {
    if (!shouldRenderTabs && restrictedTabs.includes(tab.id)) {
      return false;
    }
    return true;
  });
  
  const renderContent = () => {
    switch (active) {
      case "profile":
        return <Profile onClose={onClose} />;

      case "workspace":
        return (
          <WorkspaceSettings
            onClose={onClose}
            activeWorkspace={activeWorkspace}
          />
        );

      case "users":
      case "usage":
      case "billing":
        if (!shouldRenderTabs) return null;

        if (active === "users") {
          return (
            <WorkspaceMembersPage
              onClose={onClose}
              activeWorkspace={activeWorkspace}
            />
          );
        }

        if (active === "usage") {
          return <Usage setActive={setActive} onClose={onClose} />;
        }

        if (active === "billing") {
          return <Billing onClose={onClose} />;
        }

        return null;

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick
      style={modalStyles}
    >
      {/* 🔑 FIXED HEIGHT SHELL */}
      <div className="modal-shell">
        <div className="layout-wrapper">
          {/* SIDEBAR */}
          <div className="sidebar">
            {filteredTabs.map((t) => (
              <div
                key={t.id}
                className={`sidebar-item ${active === t.id ? "active" : ""}`}
                onClick={() => setActive(t.id)}
              >
                <div className="sidebar-icon">
                  <img height="24" width="22" src={t.icon} alt="" />
                </div>
                <span>{t.label}</span>
                {active === t.id && <div className="active-strip" />}
              </div>
            ))}
          </div>

          {/* RIGHT PANEL (SCROLLABLE) */}
            <div className="right-panel">
            <div onClick={onClose} style={{ position:'absolute', right:20, cursor:'pointer', background:"#181A1C", height:40, width:40, borderRadius:40, display:'flex', justifyContent:'center', alignItems:'center' }}>
              <img width="26px" src={close} alt="" />
            </div>
            {renderContent()}
          </div>
        </div>
      </div>
    </Modal>
  );
}
