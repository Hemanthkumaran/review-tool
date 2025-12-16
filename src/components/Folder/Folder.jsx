import { useEffect, useRef, useState } from "react";
import folderImg from "../../assets/svgs/folder.svg";
import videoIcon from "../../assets/svgs/video.svg";
import timerIcon from "../../assets/svgs/timer.svg";
import dot from "../../assets/svgs/dot.svg";
import moreCircle from "../../assets/svgs/more-circle.svg";

import ActionPopover from "../ActionPopover";
import { updateFolderApi, deleteFolderApi } from "../../services/api";
import DeleteConfirmModal from "../modals/DeleteConfirmationModal";

import "./Folder.css";
import { PenIcon, TrashIcon } from "../../assets/svgs/SvgComponents";

const Folder = ({ folder, onClick, onDeleted, onRenamed }) => {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // ✅ NEW
  const [isRenaming, setIsRenaming] = useState(false);
  const [name, setName] = useState(folder.name);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isRenaming]);

  const commitRename = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === folder.name) {
      setName(folder.name);
      setIsRenaming(false);
      return;
    }

    setSaving(true);
    try {
      await updateFolderApi(folder._id, { name: trimmed });
      onRenamed?.(folder._id, trimmed);
    } catch (e) {
      console.error("Rename failed", e);
      setName(folder.name);
    } finally {
      setSaving(false);
      setIsRenaming(false);
    }
  };

  const cancelRename = () => {
    setName(folder.name);
    setIsRenaming(false);
  };

  const handleDelete = async () => {
    try {
      await deleteFolderApi(folder._id);
      onDeleted?.(folder._id);
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        if (!menuOpen) setHovered(false); // ✅ IMPORTANT
      }}
    >
      {/* MORE MENU */}
      <div className="absolute top-[45px] right-[10px] z-10">
        <ActionPopover
          open={menuOpen}
          onOpenChange={setMenuOpen}
          trigger={
            <img
              src={moreCircle}
              alt=""
              onClick={(e) => e.stopPropagation()}
              className={`
                cursor-pointer
                transition-opacity
                ${(hovered || menuOpen)
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"}
              `}
            />
          }
          items={[
            {
              id: "rename",
              label: "Rename",
              icon: <PenIcon color="#fff"/>,
              onClick: () => {
                setIsRenaming(true);
                setMenuOpen(false);
              },
            },
            {
              id: "delete",
              label: "Delete",
              icon: <TrashIcon color="#fff"/>,
              onClick: () => {
                setShowDelete(true);
                setMenuOpen(false); // ✅ CLOSE AFTER CLICK
              },
            },
          ]}
        />
      </div>

      {/* FOLDER CARD */}
      <div
        className="main-box"
        onClick={!isRenaming ? onClick : undefined}
      >
        <img className="full-box" src={folderImg} alt="" />
        <div className="small-box" />

        <div className="text-box">
          {!isRenaming ? (
            <div className="text-lg text-white font-medium truncate mb-3">
              {folder.name}
            </div>
          ) : (
            <input
              ref={inputRef}
              value={name}
              disabled={saving}
              onChange={(e) => setName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") cancelRename();
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
          )}

          <div className="text-box-content mt-[-10px]">
            <div className="flex items-center mr-1">
              <img src={videoIcon} width={16} height={16} className="mr-1" />
              <span className="text-[#999]">6 Projects</span>
            </div>

            <img src={dot} className="mx-2" />

            <div className="flex items-center">
              <img src={timerIcon} width={16} height={16} className="mr-1" />
              <span className="text-[#999]">5 mins</span>
            </div>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      <DeleteConfirmModal
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete this folder and all its projects?"
        description="Everything inside this folder will be removed permanently."
        confirmText="DELETE"
        confirmLabel="Delete permanently"
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Folder;
