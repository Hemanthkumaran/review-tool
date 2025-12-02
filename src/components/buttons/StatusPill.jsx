import React from "react";
import tick from '../../assets/svgs/tick.png'
import arrowDown from '../../assets/svgs/arrow-down.svg'

export default function StatusPill({
  label = "Completed",
  icon = null,
  onClick,
  className = "",
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`
        inline-flex items-center gap-2
        px-3 py-2.5
        rounded-full
        bg-[#0E0E0E]
        border border-[#181A1C]
        shadow-[0_2px_4px_rgba(0,0,0,0.45)]
        text-sm text-white
        ${className}
      `}
    >
      {/* Left icon (green check) */}
      {icon ? (
        icon
      ) : (
        <img src={tick}/>
      )}
      {/* Label */}
      <span style={{ fontFamily:'Gilroy-Light', marginRight:2 }}>{label}</span>

      {/* Down chevron */}
      <img src={arrowDown}/>
    </button>
  );
}
