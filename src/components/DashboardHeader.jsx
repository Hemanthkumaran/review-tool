import { useEffect, useRef, useState } from "react";
// import bellIcon from "../assets/svgs/bell.svg";
import arrowDown from "../assets/svgs/arrow-down.svg";
// import ownerLogo from "../assets/svgs/owner.svg";
import ProfileMenu from "./ProfileMenu";
import WorkspaceDropdown from "./WorkspaceDropdown";
import SettingsModal from "./karn-comp/Layout/Settings/SettingsModal";
import { constants } from "../helpers/enum";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "../routes/paths";
import { useWorkspace } from "../context/WorkspaceContext";
import { getInitials } from "../helpers/common";

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

function DashboardHeader({ userAccess, activeWorkspace, workspaces, user, setActiveWorkspace, workspacePlan, trialUsed }) {

  const location = useLocation();
  const navigate = useNavigate();
  const { setBrandingColor } = useWorkspace();
  const workspaceRef = useRef(null);

  const [openProfile, setOpenProfile] = useState(false);
  const [openWorkspace, setOpenWorkspace] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading] = useState(false);
  const profileBtnRef = useRef(null);
  const minutesCap =
  workspacePlan?.subscription?.baseStorageMinutes +
  workspacePlan?.subscription?.additionalStorageMinutes;

  const rawMinutesUsed = workspacePlan?.subscription?.storageMinutesUsed ?? 0;
  const minutesUsed = Number(rawMinutesUsed);
  const formattedMinutesUsed = minutesUsed.toFixed(2);
  // const minutesUsed = workspacePlan?.subscription?.storageMinutesUsed.toFixed(2);

  const usagePercent = minutesCap
    ? Math.min(100, (minutesUsed / minutesCap) * 100)
  : 0;
  console.log(userAccess === constants.OWNER, !trialUsed);
  
  const showUsage =
  userAccess === constants.OWNER && trialUsed;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        workspaceRef.current &&
        !workspaceRef.current.contains(event.target)
      ) {
        setOpenWorkspace(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getUsageColor = () => {
    if (usagePercent < 60) return "#24B491";
    if (usagePercent < 90) return "#FFA500"; // orange
    return "#820000";
  };

  const handleWorkspaceChange = (workspace) => {
    setActiveWorkspace(workspace);
    setOpenWorkspace(false);
    setBrandingColor(workspace?.colourCode ?? '#F9EF38');
    if (location.pathname === "/dashboard/add-project") {
      navigate(`${PATHS.DASHBOARD}?ws=${activeWorkspace?._id}`)
    }
  };
  
  return (
    <header className="flex items-center justify-between px-2 md:px-2">
      {/* LEFT: WORKSPACE */}
      <div className="relative" ref={workspaceRef}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            setOpenWorkspace((v) => !v);
          }}
          className="flex items-center gap-3 rounded-full bg-[#151618] border border-[#101213] px-3 py-2 cursor-pointer"
        >
          {activeWorkspace?.logo?.url ?
          <img style={{ height:40, width:40, borderRadius:40 }} src={activeWorkspace?.logo?.url} /> :
          null
          }
          <span className="text-sm md:text-base font-medium">
            {activeWorkspace?.name}
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
            onSelect={handleWorkspaceChange}
          />
        )}
      </div>

      <div className="flex items-center gap-3 md:gap-4">

        <div className="hidden sm:flex items-center gap-3 rounded-full bg-[#070707] border border-[#101213] px-3 py-2">
          {showUsage ? <div className="text-xs text-[#BFBFBF] min-w-[84px]">
            {formattedMinutesUsed} / {minutesCap} mins
            <div className="h-1 w-28 mt-1 rounded-full bg-[#1E1F22] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ 
                  width: `${usagePercent}%`,
                  backgroundColor: getUsageColor(),
               }}
              />
            </div>
            </div> : null}

          {/* <button className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1E1F22] hover:bg-[#24262A]">
            <Plus className="h-4 w-4" />
          </button> */}
        </div>

        <div
          className="flex items-center justify-between"
          // style={{
          //   border: "2px solid #181A1C",
          //   borderRadius: 30,
          //   padding: "2px 4px",
          //   width: 140,
          // }}
        >
          {/* <div
            className="flex items-center justify-center"
            style={{
              border: "2px solid #181A1C",
              borderRadius: 40,
              height: 40,
              width: 40,
            }}
          >
            <img src={bellIcon} />
          </div> */}

          {/* PROFILE CLICK (FIXED – NO FLICKER) */}
          <div
            className="relative cursor-pointer"
            ref={profileBtnRef}
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
                {user?.profileImage?.url ?
                  <img
                    src={user?.profileImage?.url}
                    alt="User"
                    className="h-9 w-9 rounded-full object-cover"
                  /> : 
                    <div>{getInitials(user?.firstName, user?.lastName)}</div>
                  }
              </button>
              <img src={arrowDown} />
            </div>

            {openProfile && (
              <ProfileMenu
                onClose={() => setOpenProfile(false)}
                onOpenSettings={() => setCreateModalOpen(true)}
                triggerRef={profileBtnRef}
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
