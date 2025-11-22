import React, { useState, useRef, useEffect } from "react";
import arrowDown from '../../assets/svgs/arrow-down.svg'

const menuItems = [
  { id: "rename", label: "Rename", icon: "edit" },
  { id: "share", label: "Share", icon: "share" },
  { id: "delete", label: "Delete", icon: "trash" },
];

export default function DownloadMenuButton({ onAction }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleItemClick = (id) => {
    setOpen(false);
    onAction && onAction(id); // e.g. "rename" | "share" | "delete"
  };

  return (
    <div ref={wrapperRef} className="relative inline-block">
      {/* Pill button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="
          inline-flex items-center gap-2
          rounded-full
          bg-[#F9EF38]
          px-4 py-2.5
          text-sm font-medium
          text-black
          shadow-[0_2px_4px_rgba(0,0,0,0.25)]
          border border-[#F9EF38]
          hover:bg-[#FFEE5A]
          transition-colors
        "
      >
        <span style={{ fontFamily:'Gilroy-Light'}}>Download original</span>

        {/* chevron */}
        <svg
          className={`w-4 h-4 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path
            d="M4 6l4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Popover menu */}
      {open && (
        <div
          className="
            absolute left-0 mt-2
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
            {menuItems.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    flex items-center gap-2 w-full
                    px-3 py-2 text-sm
                    text-[#E5E5E5]
                    hover:bg-[#141414]
                    ${index === menuItems.length - 1 ? "border-t border-[#292929]" : ""}
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
  );
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
