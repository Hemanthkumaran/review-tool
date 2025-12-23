import React, { useState } from "react";
import "./SettingsLayout.css";
import Profile from "../../Pages/Profile/Profile";
import WorkspaceSettings from "../../Pages/WorkspaceSettings/WorkspaceSettings";
import ManageWorkspaceModal from "../../Pages/Users/MembersLayout";
import WorkspaceMembersPage from "../../Pages/Users/WorkspaceMembers";
import Billing from "../../Pages/Billing/Billing";
import { Usage } from "../../Pages/Usage/Usage";

import profile from "../../assets/icons/Settings/profile.svg"
import workspace from "../../assets/icons/Settings/workspace.svg";
import users from "../../assets/icons/Settings/users.svg";
import usage from "../../assets/icons/Settings/usage.svg";
import billing from "../../assets/icons/Settings/billing.svg";

const tabs = [
  { id: "profile", label: "Profile info", icon: profile },
  { id: "workspace", label: "Workspace Settings", icon: workspace },
  { id: "users", label: "Users", icon: users },
  { id: "usage", label: "Usage", icon: usage },
  { id: "billing", label: "Billing", icon: billing },
];

const SettingsLayout = () => {
  const [active, setActive] = useState("profile");

  const renderContent = () => {
    switch (active) {
      case "profile":
        return (
          <div className="placeholder-content">
            <Profile />
          </div>
        );
      case "workspace":
        return (
          <div className="placeholder-content">
            <WorkspaceSettings />
          </div>
        );
      case "users":
        return (
          <div className="placeholder-content">
            {/* <ManageWorkspaceModal /> */}
            <WorkspaceMembersPage />
          </div>
        );
      case "usage":
        return (
          <div className="placeholder-content">
            <Usage />
          </div>
        );
      case "billing":
        return (
          <div className="placeholder-content">
            <Billing />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="layout-wrapper">
      {/* SIDEBAR */}
      <div className="sidebar">
        {tabs.map((t) => (
          <div
            key={t.id}
            className={`sidebar-item ${active === t.id ? "active" : ""}`}
            onClick={() => setActive(t.id)}
          >
            <div className="sidebar-icon"><img height="24px" width="22px" src={t.icon} alt="" /></div>
            <span>{t.label}</span>
            {active === t.id && <div className="active-strip" />}
          </div>
        ))}
      </div>

      {/* RIGHT PANEL */}
      <div className="right-panel">{renderContent()}</div>
    </div>
  );
};

export default SettingsLayout;
