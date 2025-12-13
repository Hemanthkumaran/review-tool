import React, { useEffect, useRef, useState } from "react";
import { updateProjectStatusApi } from "../services/api";
import tick from '../assets/svgs/tick.png'

export default function ProjectStatusDropdown({
  projectId,
  initialStatus = "in progress", // backend default
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);
  const ref = useRef(null);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = async (next) => {
    if (next === status || saving) return;

    setStatus(next); // optimistic
    setSaving(true);
    setOpen(false);

    try {
      await updateProjectStatusApi(projectId, next);
      onChange?.(next);
    } catch (e) {
      console.error("Failed to update project status", e);
      setStatus(status); // rollback
    } finally {
      setSaving(false);
    }
  };

  const isCompleted = status === "completed";

  return (
    <div ref={ref} className="relative">
      {/* pill button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="
          flex items-center gap-2
          rounded-full
          px-4 py-2
          bg-[#0F1012]
          border border-[#1F2023]
          text-sm text-gray-200
          hover:bg-[#151618]
          transition
        "
      >
        {/* status dot */}
        {isCompleted ? <img src={tick}/> : 
        <span
          className={"w-2.5 h-2.5 rounded-full bg-yellow-400"}
        />}
        <span style={{ fontFamily: "Gilroy-Light" }}>
          {isCompleted ? "Completed" : "In progress"}
        </span>

        {/* chevron */}
        <svg
          className={`w-3.5 h-3.5 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 16 16"
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

      {/* dropdown */}
      {open && (
        <div
          className="
            absolute right-0 mt-2 w-44
            rounded-xl
            bg-[#050506]
            border border-[#202124]
            shadow-[0_12px_30px_rgba(0,0,0,0.6)]
            overflow-hidden
            z-50
          "
        >
          <button
            onClick={() => handleSelect("in progress")}
            className={`
              w-full px-4 py-2.5 text-left text-sm
              hover:bg-white/5
              ${status === "in progress" ? "text-[#FEEA3B]" : "text-gray-200"}
            `}
          >
            In progress
          </button>

          <button
            onClick={() => handleSelect("completed")}
            className={`
              w-full px-4 py-2.5 text-left text-sm
              hover:bg-white/5
              ${status === "completed" ? "text-[#FEEA3B]" : "text-gray-200"}
            `}
          >
            Completed
          </button>
        </div>
      )}
    </div>
  );
}
