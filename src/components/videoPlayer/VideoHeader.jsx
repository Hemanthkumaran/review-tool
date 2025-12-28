import DownloadMenuButton from '../Buttons/DownloadMenuBtn'
import LeftArrow from '../../assets/svgs/arrow-left.svg';
import VersionSwitcher from '../VersionSwitcher';
import { useState } from 'react';
import ProjectStatusDropdown from '../ProjectStatus';
import { constants } from '../../helpers/enum';
import StatusDropdown from '../StatusDropdown';
import { updateProjectApi } from '../../services/api';




function VideoHeader({ projectDetail, goBack, versions, onChangeVersion, activeVersionId, onAddNewVersion, userAccess }) {
  
  const [open, setOpen] = useState(false);
  const [projectStatus, setProjectStatus] = useState(projectDetail.status)
  console.log(projectStatus, 'ldkjsf');
  
  const handleItemClick = (id) => {
    setOpen(false);
  };

  function getMenutItems() {
    const menuItems = [
      { id: "rename", label: "Rename", icon: "edit" },
    ];

    if (userAccess == constants.OWNER || userAccess == constants.MEMBER) {
      menuItems.push({ id: "share", label: "Share", icon: "share" });
    }

    if (userAccess == constants.OWNER) {
      menuItems.push({ id: "delete", label: "Delete", icon: "trash" }, { id: "assign", label: "Assign", icon: "share" });
    }

    return menuItems;
  }

  const onStatusChange = async (id, payload) => {
    console.log(id, payload, 'id, payload');
    setProjectStatus(payload);
    try {
      await updateProjectApi(id, {status: payload});
    } catch (err) {
      console.error("Update failed", err);
    }
  };


  return (
    <div style={{ marginLeft:40}} className="flex items-center justify-between mb-6">
        <div className="flex items-center">
            <img onClick={goBack} style={{ height:20, width:20, cursor:'pointer' }} src={LeftArrow} />
            <div style={{ height:20, width:0.8,  background:"#202020", margin:"0 10px" }}/>
            <div className="flex items-center">
            <div style={{ fontFamily:"Gilroy-Light" }}>
                {projectDetail.name}{" "}
            </div>
            <VersionSwitcher
                versions={versions}
                currentVersionId={activeVersionId}
                onSelectVersion={(v) => onChangeVersion(v)}
                onAddNewVersion={onAddNewVersion}
                userAccess={userAccess}
                onUploadNewVersion={() => {
                // same upload flow from inside the modal
                }}
                onDownloadVersion={(v) => {
                // call download API
                }}
                onDeleteVersion={(v) => {
                // call delete API
                }}
            />
            {/* <div style={{ marginLeft:10 }}><VersionPill onClick={() => console.log("version pill clicked")} /></div> */}
            </div>
        </div>
        <div className="flex items-center justify-between">
            {/* <StatusPill/> */}
            {/* <ProjectStatusDropdown
              projectId={projectDetail._id}
              initialStatus={projectDetail.status || "in progress"}
              onChange={(s) => {
                // optional: update local projectDetail state
                console.log("Project status updated:", s);
              }}
            /> */}
              <StatusDropdown
                value={projectStatus}
                onChange={(status) => onStatusChange?.(projectDetail._id, status)}
              />
              {userAccess !== constants.REVIEWER && <div style={{ margin:"0 10px" }}>
                <DownloadMenuButton projectDetail={projectDetail} onAction={() => null} />
              </div>}
            <div className="relative">
            {(userAccess == constants.OWNER || userAccess == constants.MEMBER) && <button
              onClick={() => setOpen(prev => !prev)}
              style={{ border: "1px solid #181A1C", borderRadius: 30 }}
              className="p-3.5 px-5 rounded-full hover:bg-white/5 cursor-pointer"
            >
              <svg
                width="4"
                height="16"
                viewBox="0 0 4 16"
                fill="none"
              >
                <circle cx="2" cy="2" r="1.4" fill="#D1D5DB" />
                <circle cx="2" cy="8" r="1.4" fill="#D1D5DB" />
                <circle cx="2" cy="14" r="1.4" fill="#D1D5DB" />
              </svg>
            </button>}
            {open && (
              <div
                className="
                  absolute right-0 top-full mt-2
                  w-40
                  rounded-xl
                  bg-[#050505]
                  border border-[#2A2A2A]
                  shadow-[0_12px_30px_rgba(0,0,0,0.6)]
                  overflow-hidden
                  z-50
                "
              >
                <ul className="py-1">
                  {getMenutItems().map((item, index) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => handleItemClick(item.id)}
                        className={`
                          flex items-center gap-2 w-full
                          px-3 py-2 text-sm
                          text-[#E5E5E5]
                          hover:bg-[#141414]
                          cursor-pointer
                          ${index === getMenutItems().length - 1 ? "border-t border-[#292929]" : ""}
                        `}
                      >
                        {getIcon(item.icon)}
                        <span>{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
    </div>
  )
}

// simple inline icons to match the design
function getIcon(type) {
  switch (type) {
    case "edit":
      return (
        <svg
          className="w-4 h-4 opacity-80"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M4 13.5L4.5 11l7-7 2.5 2.5-7 7L4 13.5z" />
          <path d="M11.5 4.5l2.5 2.5" />
        </svg>
      );
    case "share":
      return (
        <svg
          className="w-4 h-4 opacity-80"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M7 10l3-3 3 3" />
          <path d="M10 7v9" />
          <path d="M5 16h10" />
        </svg>
      );
    case "trash":
      return (
        <svg
          className="w-4 h-4 opacity-80"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M7 4h6" />
          <path d="M5 5h10l-1 11H6L5 5z" />
          <path d="M8 8v6M12 8v6" />
        </svg>
      );
    default:
      return null;
  }
}


export default VideoHeader