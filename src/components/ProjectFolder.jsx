import { useState } from "react";
import dot from "../assets/svgs/dot.svg";
import message from "../assets/svgs/message.svg";
import StatusDropdown from "./StatusDropdown";
import ProjectMoreMenu from "./ProjectMoreMenu";
import { PlusIcon } from "../assets/svgs/SvgComponents";
import DeleteConfirmModal from "./modals/DeleteConfirmationModal";
import { getMuxGif, getMuxThumbnail } from "../helpers/muxHelpers";

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

export default function ProjectFolder({
  project,
  onClick,
  onRename,
  onDelete,
  onStatusChange,
}) {

  const createdAtLabel = formatDateTime(project.createdAt);
  const commentCount = getTotalComments(project);
  const [isRenaming, setIsRenaming] = useState(false);
  const [name, setName] = useState(project.name);
  const [showDelete, setShowDelete] = useState(false);


  return (
    <div
      className="relative rounded-[20px] p-2 border-1 border-[#F9EF38] bg-black cursor-pointer"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="rounded-2xl overflow-hidden border border-[#2A2A2A]">
        <img loading="lazy" src={getMuxGif(project?.versions[0]?.muxPlaybackID)} alt={project.name} className="w-full" />
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
                className="bg-transparent outline-none text-[18px] font-[Gilroy-SemiBold]"
              />
            ) : (
              <div
                className="text-[18px] font-[Gilroy-SemiBold]"
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
          <ProjectMoreMenu
            onRename={() => setIsRenaming(true)}
            onDelete={() => setShowDelete(true)}
          />
        </div>
        <div className="flex items-center gap-2 mt-3">
        {/* existing avatars here */}
        <button
          className="w-8 h-8 rounded-full bg-[#BFBFBF] text-black flex items-center justify-center text-xl hover:opacity-90"
          title="Add collaborator"
        >
          <PlusIcon color="#000000"/>
        </button>
      </div>
        <StatusDropdown
          value={project.status}
          onChange={(status) => onStatusChange?.(project._id, status)}
        />
      </div>
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
