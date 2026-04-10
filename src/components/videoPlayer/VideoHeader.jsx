import DownloadMenuButton from '../Buttons/DownloadMenuBtn'
import LeftArrow from '../../assets/svgs/arrow-left.svg';
import VersionSwitcher from '../VersionSwitcher';
import { useEffect, useRef, useState } from 'react';
import ProjectStatusDropdown from '../ProjectStatus';
import { constants } from '../../helpers/enum';
import StatusDropdown from '../StatusDropdown';
import { deleteProjectApi, updateProjectApi } from '../../services/api';
import AssignEditorsModal from '../modals/AssignEditorsModal';
import ShareModal from '../modals/ShareModal';
import DeleteConfirmModal from '../modals/DeleteConfirmationModal';
import { useWorkspace } from '../../context/WorkspaceContext';
import { AssignIcon, PenIcon, ShareIcon, TrashIcon } from '../../assets/svgs/SvgComponents';



function VideoHeader({ fetchProject, onDeleteVersion, handleUpdateProject, projectDetail, goBack, versions, onChangeVersion, activeVersionId, onAddNewVersion, userAccess }) {
  
  const [open, setOpen] = useState(false);
  const [projectStatus, setProjectStatus] = useState(projectDetail.status)
  const [isRenaming, setIsRenaming] = useState(false);
  const [name, setName] = useState(projectDetail.name);
  const [openAssign, setOpenAssign] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const menuRef = useRef(null);
  const { workspaceUsers } = useWorkspace();

const closeMoreMenu = () => setOpen(false);

  useEffect(() => {
  if (!open) return;

  const handler = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setOpen(false);
    }
  };

  document.addEventListener("mousedown", handler);
  return () => document.removeEventListener("mousedown", handler);
}, [open]);

  
  const handleItemClick = (id) => {
    setOpen(false);

    if (id === "rename") {
      setName(projectDetail.name);
      setIsRenaming(true);
    }

    if (id === "assign") {
      setOpenAssign(true);
    }

    if (id === "share") {
      setOpenShare(true);
    }

    if (id === "delete") {
      setShowDelete(true);
    }
  };

  function getMenutItems() {
    const menuItems = [
      { id: "rename", label: "Rename", icon: "edit" },
    ];

    if (userAccess == constants.OWNER || userAccess == constants.MEMBER) {
      menuItems.push({ id: "share", label: "Share", icon: "share" });
    }

    if (userAccess == constants.OWNER) {
      menuItems.push({ id: "delete", label: "Delete", icon: "trash" }, { id: "assign", label: "Assign", icon: "assign" });
    }

    return menuItems;
  }

  const onStatusChange = async (id, payload) => {
    setProjectStatus(payload);
    try {
      await updateProjectApi(id, {status: payload});
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleOpen = (link) => {
    if (!link) return;

    const formattedLink = link.startsWith("http")
      ? link
      : `https://${link}`;

    window.open(formattedLink, "_blank", "noopener,noreferrer");
  };


  return (
    <div className="select-none mb-2 flex min-w-0 items-center justify-between gap-4 lg:mb-3">
        <div className="flex min-w-0 items-center">
          <div onClick={goBack} className="flex items-center justify-center" style={{ height:40, width:40, cursor:'pointer' }}><img src={LeftArrow} /></div>
            <div style={{ height:20, width:0.8,  background:"#202020", margin:"0 10px" }}/>
            <div className="flex min-w-0 items-center">
              <div className="min-w-0 max-w-[220px]">
                {isRenaming ? (
                  <input
                    autoFocus
                    value={name}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    onBlur={() => {
                      if (name.trim() && name !== projectDetail.name) {
                        handleUpdateProject(projectDetail._id, { name: name.trim() });
                      }
                      setIsRenaming(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur();
                      if (e.key === "Escape") {
                        setName(projectDetail.name);
                        setIsRenaming(false);
                      }
                    }}
                    className="bg-[#0F1012] border border-[#2A2B2F] rounded-lg px-2 py-1 text-white outline-none"
                  />
                ) : (
                  <div
                    className="text-[18px] font-[Gilroy-SemiBold] truncate"
                    title={projectDetail.name}
                  >
                    {projectDetail.name}
                  </div>
                )}
              </div>

            <VersionSwitcher
                versions={versions}
                currentVersionId={activeVersionId}
                onSelectVersion={(v) => onChangeVersion(v)}
                onAddNewVersion={onAddNewVersion}
                userAccess={userAccess}
                projectName={projectDetail.name}
                onDownloadVersion={() => {
                // call download API
                }}
                onDeleteVersion={onDeleteVersion}
            />
            {/* <div style={{ marginLeft:10 }}><VersionPill onClick={() => console.log("version pill clicked")} /></div> */}
            </div>
        </div>
        <div className="flex shrink-0 items-center justify-between">
            {/* <StatusPill/> */}
            {/* <ProjectStatusDropdown
              projectId={projectDetail._id}
              initialStatus={projectDetail.status || "in progress"}
              onChange={(s) => {
                // optional: update local projectDetail state
                console.log("Project status updated:", s);
              }}
            /> */}
            <div style={{ margin:"0 10px" }}>
              <StatusDropdown
                disabled={userAccess == constants.REVIEWER}
                value={projectStatus}
                onChange={(status) => onStatusChange?.(projectDetail._id, status)}
                py={2}
                mt={1}
              />
              </div>
              {((userAccess == constants.REVIEWER && projectDetail?.downloadLink)) ?
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()} 
                onClick={() => handleOpen(projectDetail?.downloadLink)}
                className="
                  inline-flex items-center gap-2
                  cursor-pointer
                  rounded-full
                  bg-[var(--brand-color)]
                  px-4 py-2
                  text-sm font-medium
                  text-black
                  shadow-[0_2px_4px_rgba(0,0,0,0.25)]
                  border border-[var(--brand-color)]
                  hover:bg-[var(--brand-color)]
                  transition-colors
                "
              >
                  <span style={{ fontFamily:'Gilroy-Light'}}>Download original</span>
              </button> :
               <div style={{ margin:"0 10px" }}>
                <DownloadMenuButton projectDetail={projectDetail} onAction={closeMoreMenu} onRefresh={fetchProject} userAccess={userAccess}/>
              </div>
              }
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
                ref={menuRef}
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
        <AssignEditorsModal
          open={openAssign}
          onClose={() => setOpenAssign(false)}
          permissions={workspaceUsers?.permissions}
          projectAccess={projectDetail?.permissions}
          projectID={projectDetail._id}
          onRefresh={fetchProject}
        />

        <ShareModal
          open={openShare}
          onClose={() => setOpenShare(false)}
          permissions={workspaceUsers?.permissions}
          projectAccess={projectDetail?.permissions}
          projectID={projectDetail._id}
          projectDetail={projectDetail}
          onRefresh={fetchProject}
        />

        <DeleteConfirmModal
          open={showDelete}
          onOpenChange={setShowDelete}
          title="Delete this project?"
          description="The project and all its versions and comments will be removed permanently."
          confirmText="DELETE"
          confirmLabel="Delete permanently"
          onConfirm={async () => {
            await deleteProjectApi(projectDetail._id);
            goBack(); // return to project list
          }}
        />
    </div>
  )
}

// simple inline icons to match the design
function getIcon(type) {
  switch (type) {
    case "assign":
      return <AssignIcon color="#FFF" />
    case "edit":
      return <PenIcon color="#FFF" />
    case "share":
      return <ShareIcon color="#FFF" />
    case "trash":
      return <TrashIcon color="#FFF" />
    default:
      return null;
  }
}


export default VideoHeader
