import React, { useState } from "react";
import "./SettingsLayout.css";
import { FaUser, FaBuilding, FaUsers, FaClock } from "react-icons/fa";
import UsageBilling from "../../Pages/UsageBilling/UsageBilling";

const tabs = [
  { id: "profile", label: "Profile info", icon: <FaUser /> },
  { id: "agency", label: "Agency settings", icon: <FaBuilding /> },
  { id: "users", label: "Users", icon: <FaUsers /> },
  { id: "billing", label: "Usage and Billing", icon: <FaClock /> },
];

const SettingsLayout = () => {
  const [active, setActive] = useState("billing");

  const renderContent = () => {
    switch (active) {
      case "profile":
        return (
          <div className="placeholder-content">Profile info page content</div>
        );
      case "agency":
        return (
          <div className="placeholder-content">Agency settings content</div>
        );
      case "users":
        return <div className="placeholder-content">Users page content</div>;
      case "billing":
        return (
          <div className="placeholder-content">
            <UsageBilling/>
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
            <div className="sidebar-icon">{t.icon}</div>
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
