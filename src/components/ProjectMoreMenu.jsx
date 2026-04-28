import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import moreIcon from "../assets/svgs/more-circle.svg";
import { constants } from "../helpers/enum";
import {
  AssignIcon,
  PenIcon,
  ShareIcon,
  TrashIcon,
} from "../assets/svgs/SvgComponents";

export default function ProjectMoreMenu({
  onRename,
  onDelete,
  userAccess,
  onOpenAssign,
  openShare
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open) return;

    const rect = buttonRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + window.scrollY + 8,
      left: rect.right + window.scrollX - 192, // menu width
    });

    const handler = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () =>
      document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <>
      {/* Trigger */}
      <button
        ref={buttonRef}
        className="rounded-full cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <img src={moreIcon} alt="" />
      </button>

      {/* Menu (PORTAL) */}
      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "absolute",
              top: pos.top,
              left: pos.left,
            }}
            className="w-48 rounded-xl bg-[#101213] border border-[#232427] z-[9999] shadow-xl"
          >
            <MenuItem
              label="Rename"
              icon={<PenIcon color="#FFF" />}
              onClick={() => {
                setOpen(false);
                onRename?.();
              }}
            />

            <MenuItem
              label="Share with"
              icon={<ShareIcon color="#FFF" />}
              onClick={() => {
                openShare()
                setOpen(false)
              }}
            />

            {userAccess === constants.OWNER && (
              <MenuItem
                label="Assign to"
                icon={<AssignIcon color="#FFF" />}
                onClick={() => {
                  onOpenAssign()
                  setOpen(false)
                }}
              />
            )}

            <div className="h-px bg-[#1F1F21]" />

            {userAccess === constants.OWNER && (
              <MenuItem
                label="Delete"
                icon={<TrashIcon color="#FFF" />}
                onClick={() => {
                  setOpen(false);
                  onDelete?.();
                }}
              />
            )}
          </div>,
          document.body
        )}
    </>
  );
}

function MenuItem({ label, onClick, icon }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="w-full text-left px-4 py-2 text-sm text-gray-300 flex items-center hover:bg-white/5"
    >
      <div>{icon}</div>
      <div className="ml-2">{label}</div>
    </button>
  );
}
