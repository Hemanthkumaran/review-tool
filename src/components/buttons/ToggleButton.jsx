import React from "react";

export default function ToggleButton({
  checked,
  onChange
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`
        relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer
        ${checked ? "bg-[#F9EF38]" : "bg-[#1C1D1F]"}
        focus:outline-none
      `}
    >
      {/* Knob */}
      <span
        className={`
          absolute top-[2px] left-[3px]
          w-5 h-5 rounded-full
          bg-[#0B0B0C]
          transition-transform duration-300 ease-out
          ${checked ? "translate-x-6" : "translate-x-0"}
        `}
      />
    </button>
  );
}
