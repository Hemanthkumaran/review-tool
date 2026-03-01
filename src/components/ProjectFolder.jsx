import { useState } from "react";
import dot from "../assets/svgs/dot.svg";
import message from "../assets/svgs/message.svg";
import StatusDropdown from "./StatusDropdown";
import ProjectMoreMenu from "./ProjectMoreMenu";
import { PlusIcon } from "../assets/svgs/SvgComponents";
import DeleteConfirmModal from "./modals/DeleteConfirmationModal";
import { getMuxGif } from "../helpers/muxHelpers";
import { useWorkspace } from "../context/WorkspaceContext";
import { constants } from "../helpers/enum";
import AssignEditorsModal from "./modals/AssignEditorsModal";
import { addUserToProjectApi } from "../services/api";
import { showSuccessToast } from "../helpers/showToast";
import ShareModal from "./modals/ShareModal";
import { formatDuration } from "../helpers/common";

const formatDateTime = (isoString) => {
  if (!isoString) return "-";
  const d = new Date(isoString);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const getTotalComments = (project) => {
  if (!project?.versions?.length) return 0;
  return project.versions.reduce(
    (sum, v) => sum + (v.comments?.length || 0),
    0
  );
};

function AssignedEditorsRow({
  permissions = [],
  onOpenAssign,
  userAccess
}) {
  const visible = permissions.slice(0, 3);
  const extra = permissions.length - visible.length;
  
  return (
    <div className="flex items-center gap-1">
      {/* Avatars */}
      {visible.map((p, idx) => (
        <div
          key={p._id}
          title={p.email}
          className={`w-8 h-8 rounded-full border-2 border-black bg-[#2A2B2F]
            overflow-hidden flex items-center justify-center text-xs text-white cursor-pointer
            ${idx !== 0 ? "-ml-2" : ""}`}
        >
          {/* placeholder avatar */}
          <span className="uppercase">
            {p.email?.[0] || "?"}
          </span>
        </div>
      ))}

        {userAccess == constants.OWNER && <div
          onClick={(e) => {
            e.stopPropagation();
            onOpenAssign();
        }}
          className="-ml-2 w-8 h-8 rounded-full bg-[#D1D5DB]
            text-black flex items-center justify-center text-sm font-medium cursor-pointer"
        >
          { 
            extra <= 0 ?  
            <PlusIcon color="#000" /> :
            <span> + {extra} </span>
          }
        </div>}
    </div>
  );
}

export default function ProjectFolder({
  project,
  onClick,
  onRename,
  onDelete,
  onStatusChange,
  fetchGetAllProjs
}) {

  const createdAtLabel = formatDateTime(project.createdAt);
  const commentCount = getTotalComments(project);
  const [isRenaming, setIsRenaming] = useState(false);
  const [name, setName] = useState(project.name);
  const [showDelete, setShowDelete] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  console.log(project, 'project');
  
  const { userAccess, workspaceUsers } = useWorkspace();

  const latestVersion = project?.versions[project.versions?.length - 1];
  
  
const handleAssignEditors = async (editors) => {
  try {
    await Promise.all(
      editors.map((user) =>
        addUserToProjectApi(project._id, user.email)
      )
    );

    showSuccessToast("Editors assigned successfully"); // if you’re using toast
    setOpenAssign(false);
  } catch (err) {
    console.error(err);
    alert("Failed to assign editors");
  }
};


  return (
    <div
        className="
        relative rounded-[20px] p-2 bg-black cursor-pointer
        border border-transparent
        hover:border-[#F9EF38]
        group
        transition
      "
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="rounded-2xl overflow-hidden border border-[#2A2A2A] bg-black aspect-[16/9]">
        <img
          loading="lazy"
          src={getMuxGif(project?.versions[0]?.muxPlaybackID)}
          alt={project.name}
          className="w-full h-full object-cover"
        />
        <div style={{"backgroundColor":"rgb(24, 26, 28)","position":"absolute","top":"15px","right":"15px","fontSize":"11px","padding":"3px 8px","borderRadius":"10px"}}>v2</div>
        <div style={{"backgroundColor":"rgb(24, 26, 28)","position":"absolute","top":"105px","right":"15px","fontSize":"11px","padding":"3px 8px","borderRadius":"10px"}}>
          {formatDuration(latestVersion?.videoDuration)}
        </div>
      </div>
      {/* Content */}
      <div className="px-2 pt-3">
        <div className="flex items-start justify-between">
          <div>
            {isRenaming ? (
              <input
                autoFocus
                value={name}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setName(e.target.value)}
                onFocus={(e) => e.target.select()}
                onBlur={() => {
                  if (name.trim() && name !== project.name) {
                    onRename(project._id, name.trim());
                  }
                  setIsRenaming(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                  }
                  if (e.key === "Escape") {
                    setName(project.name);
                    setIsRenaming(false);
                  }
                }}
                className="
                  w-full
                  bg-[#0F1012]
                  border border-[#2A2B2F]
                  rounded-lg
                  px-2 py-1
                  text-white
                  outline-none
                  mb-3
                "
              />
            ) : (
              <div
                className="text-[18px] font-[Gilroy-SemiBold] truncate max-w-[180px]"
              >
                {project.name}
              </div>
            )}

            <div className="flex items-center text-[12px] text-[#BFBFBF] mt-1">
              <span>{createdAtLabel}</span>
              <img src={dot} className="mx-2" />
              <div className="flex items-center gap-1">
                <img src={message} />
                <span>{commentCount}</span>
              </div>
            </div>
          </div>
          <div
            className="
              opacity-0
              group-hover:opacity-100
              transition
            "
          >
          {(userAccess == constants.OWNER || userAccess == constants.MEMBER) && 
            <ProjectMoreMenu
              userAccess={userAccess}
              onRename={() => setIsRenaming(true)}
              onDelete={() => setShowDelete(true)}
              onOpenAssign={() => setOpenAssign(true)}
              openShare={() => setOpenShare(true)}
            />}
            </div>
        </div>
        <div className="flex items-center gap-2 mt-3 mb-1">
        {/* existing avatars here */}
        <AssignedEditorsRow
          permissions={project.permissions}
          onOpenAssign={() => setOpenAssign(true)}
          userAccess={userAccess}
        />
        <AssignEditorsModal
          open={openAssign}
          onClose={() => setOpenAssign(false)}
          permissions={workspaceUsers?.permissions}
          projectAccess={project?.permissions}
          onAssign={handleAssignEditors}
          projectID={project._id}
          onRefresh={fetchGetAllProjs}
        />
      </div>
        <StatusDropdown
          value={project.status}
          onChange={(status) => onStatusChange?.(project._id, status)}
          py={1}
          bgColor="#000000"
        />
      </div>
      <ShareModal 
        onClose={() => setOpenShare(false)} 
        open={openShare}
        permissions={workspaceUsers?.permissions}
        projectAccess={project?.permissions}
        projectID={project._id}
        onRefresh={fetchGetAllProjs}
      />
      <DeleteConfirmModal
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete this project?"
        description="The project and its contents (versions, comments, notes, etc) will be removed permanently."
        confirmText="DELETE"
        confirmLabel="Delete permanently"
        onConfirm={() => {
          setShowDelete(false);
          onDelete(project._id);
        }}
      />
    </div>
  );
}
