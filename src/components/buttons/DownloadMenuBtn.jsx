import React, { useState, useRef, useEffect } from "react";
import arrowDown from '../../assets/svgs/arrow-down.svg'
import { updateDownloadLinkApi } from "../../services/api";
import FinalLinkPopover from "../DownloadLinkPopover";
import { DownloadOriginalTick } from "../../assets/svgs/SvgComponents";

const menuItems = [
  { id: "rename", label: "Rename", icon: "edit" },
  { id: "share", label: "Share", icon: "share" },
  { id: "assign", label: "Assign", icon: "share" },
  { id: "delete", label: "Delete", icon: "trash" },
];

export default function DownloadMenuButton({ onAction, projectDetail, onRefresh }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  console.log(projectDetail, 'projectDetail');
  
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



  return (
    <div ref={wrapperRef} className="relative inline-block">
      {/* Pill button */}
      <button
        type="button"
        onMouseDown={(e) => e.stopPropagation()} 
        onClick={() => {
          setOpen((prev) => !prev)
          onAction()
        }}
        className="
          inline-flex items-center gap-2
          cursor-pointer
          rounded-full
          bg-[#F9EF38]
          px-4 py-2
          text-sm font-medium
          text-black
          shadow-[0_2px_4px_rgba(0,0,0,0.25)]
          border border-[#F9EF38]
          hover:bg-[#FFEE5A]
          transition-colors
        "
      >
        {projectDetail?.downloadLink && <span><DownloadOriginalTick/></span>}
        {projectDetail?.downloadLink ?
          <span style={{ fontFamily:'Gilroy-Light'}}>Download original</span> :
          <span style={{ fontFamily:'Gilroy-Light'}}>Add final video link</span>
        }
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
      {open && (
        <FinalLinkPopover
          open={open}
          onClose={() => {
            onRefresh();
            setOpen(false);
          }}
          initialValue={projectDetail?.downloadLink ?? ""}
          onSave={(link) =>
            updateDownloadLinkApi(projectDetail._id, {downloadLink: link})
          }
        />)}
    </div>
  );
}

