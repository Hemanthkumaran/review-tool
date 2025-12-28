import { useState } from "react";
import bellIcon from "../assets/svgs/bell.svg";
import arrowDown from "../assets/svgs/arrow-down.svg";
import ownerLogo from "../assets/svgs/owner.svg";
import ProfileMenu from "./ProfileMenu";
import WorkspaceDropdown from "./WorkspaceDropdown";
import SettingsModal from "./karn-comp/Layout/Settings/SettingsModal";
import { useWorkspace } from "../context/WorkspaceContext";

function Plus({ className = "" }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none">
      <path
        d="M10 4v12M4 10h12"
        stroke="#BFBFBF"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DashboardHeader({ minutesUsed, minutesCap, usagePct }) {
  const [openProfile, setOpenProfile] = useState(false);
  const [openWorkspace, setOpenWorkspace] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading] = useState(false);

  const {
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    loading,
  } = useWorkspace();

  return (
    <header className="flex items-center justify-between px-2 md:px-2">
      {/* LEFT: WORKSPACE */}
      <div className="relative">
        <div
          onClick={() => setOpenWorkspace((v) => !v)}
          className="flex items-center gap-3 rounded-full bg-[#151618] border border-[#101213] px-3 py-2 cursor-pointer"
        >
          <img src={ownerLogo} />
          <span className="text-sm md:text-base font-medium">
            {loading ? "Loading..." : activeWorkspace?.name}
          </span>

          <span
            style={{ textTransform: "capitalize" }}
            className="rounded-full bg-[#1E1F22] text-[11px] px-2 py-0.5 border border-[#2A2B2F] text-[#BFBFBF]"
          >
            {activeWorkspace?.permissionType}
          </span>

          <img src={arrowDown} />
        </div>

        {openWorkspace && (
          <WorkspaceDropdown
            workspaces={workspaces}
            activeWorkspace={activeWorkspace}
            onSelect={(ws) => {
              setActiveWorkspace(ws);
              setOpenWorkspace(false);
            }}
          />
        )}
      </div>

      {/* RIGHT CLUSTER */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Usage pill */}
        <div className="hidden sm:flex items-center gap-3 rounded-full bg-[#070707] border border-[#101213] px-3 py-2">
          <div className="text-xs text-[#BFBFBF] min-w-[84px]">
            {minutesUsed} / {minutesCap} mins
            <div className="h-1 w-28 mt-1 rounded-full bg-[#1E1F22] overflow-hidden">
              <div
                className="h-full bg-[#820000] rounded-full"
                style={{ width: `${usagePct}%` }}
              />
            </div>
          </div>

          <button className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1E1F22] hover:bg-[#24262A]">
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Profile */}
        <div
          className="flex items-center justify-between"
          style={{
            border: "2px solid #181A1C",
            borderRadius: 30,
            padding: "2px 4px",
            width: 140,
          }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              border: "2px solid #181A1C",
              borderRadius: 40,
              height: 40,
              width: 40,
            }}
          >
            <img src={bellIcon} />
          </div>

          {/* PROFILE CLICK (FIXED – NO FLICKER) */}
          <div
            className="relative cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setOpenProfile((prev) => !prev);
            }}
          >
            <div
              className="flex items-center"
              style={{
                border: "2px solid #181A1C",
                borderRadius: 30,
                padding: 5,
                width: 80,
              }}
            >
              <button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#151618] border border-[#232427] mr-3">
                <img
                  src="https://i.pravatar.cc/80?img=32"
                  alt="User"
                  className="h-9 w-9 rounded-full object-cover"
                />
              </button>
              <img src={arrowDown} />
            </div>

            {openProfile && (
              <ProfileMenu
                onClose={() => setOpenProfile(false)}
                onOpenSettings={() => setCreateModalOpen(true)}
              />
            )}
          </div>
        </div>
      </div>

      {/* SETTINGS MODAL */}
      <SettingsModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        handleCreate={() => null}
        loading={createLoading}
        activeWorkspace={activeWorkspace}
      />
    </header>
  );
}

export default DashboardHeader;
