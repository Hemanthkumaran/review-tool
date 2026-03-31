export default function ToggleButton({
  checked,
  onChange,
  size = "md", // sm | md | lg
}) {
  const SIZE_MAP = {
    sm: {
      track: "w-9 h-5",
      knob: "w-4 h-4 top-[2px] left-[2px]",
      translate: "translate-x-4",
    },
    md: {
      track: "w-12 h-6",
      knob: "w-5 h-5 top-[2px] left-[3px]",
      translate: "translate-x-6",
    },
    lg: {
      track: "w-14 h-7",
      knob: "w-6 h-6 top-[2px] left-[3px]",
      translate: "translate-x-7",
    },
  };

  const s = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`
        relative rounded-full transition-colors duration-300 cursor-pointer
        focus:outline-none
        ${s.track}
        ${checked ? "bg-[var(--brand-color)]" : "bg-[#BFBFBF]"}
      `}
    >
      {/* Knob */}
      <span
        className={`
          absolute rounded-full bg-[#0B0B0C]
          transition-transform duration-300 ease-out
          ${s.knob}
          ${checked ? s.translate : "translate-x-0"}
        `}
      />
    </button>
  );
}
