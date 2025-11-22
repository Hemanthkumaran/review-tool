// VersionPill.jsx
import React from "react";

export default function VersionPill({ label = "v2", onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        inline-flex items-center gap-0.5
        rounded-full
        bg-[#1f1f1f]
        px-2.5 py-[3px]
        text-[11px] leading-[16px]
        text-[#f5f5f5]
        shadow-[0_2px_4px_rgba(0,0,0,0.45)]
        hover:bg-[#262626]
        transition-colors
      "
    >
      <span style={{ fontSize:14, padding:"2px 0" }}>
        {label}
      </span>

      {/* down chevron */}
      <svg
        className="w-3 h-3"
        viewBox="0 0 16 16"
        aria-hidden="true"
      >
        <path
          d="M4 6l4 4 4-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
