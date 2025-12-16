import { useEffect, useRef, useState } from "react";
import moreIcon from "../assets/svgs/more-circle.svg";

export default function ProjectMoreMenu({ onRename, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Trigger */}
      <button
        className="rounded-full cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <img src={moreIcon} alt="" />
      </button>

      {/* Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#101213] border border-[#232427] z-50">
          <MenuItem
            label="Rename"
            onClick={() => {
              setOpen(false);   // ✅ CLOSE
              onRename?.();
            }}
          />
          <div className="h-px bg-[#1F1F21]" />
          <MenuItem
            label="Delete"
            danger
            onClick={() => {
              setOpen(false);   // ✅ CLOSE
              onDelete?.();
            }}
          />
        </div>
      )}
    </div>
  );
}

function MenuItem({ label, onClick, danger }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`w-full text-left px-4 py-2 text-sm
        ${danger ? "text-red-500" : "text-gray-300"}
        hover:bg-[#181A1C]`}
    >
      {label}
    </button>
  );
}
