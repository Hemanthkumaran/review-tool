import { formatClockTime2, formatRelative } from "../../../helpers/common";

export default function CommentHeader({
  createdAt,
  isResolved,
  resolving,
  sNo,
  // onGo,
  onToggleResolved,
  frame,
  videoFps
}) {


  const fps = frame ? (videoFps && frame ? (arguments[0]?.fps || videoFps) : videoFps) : videoFps;
  return (
    <div className="flex items-center justify-between mb-3">
      {/* Left */}
      <div className="flex items-center gap-2 text-[14px]">
        <span
          // onClick={onGo}
          className="text-[var(--brand-color)] cursor-pointer"
        >
          {formatClockTime2({
            frame: frame,
            fps: fps
          })}
        </span>
        <span style={{ color:"#fff" }} className="text-gray-400">•</span>
        <span style={{ color:"#323232" }}>#{sNo}</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 text-[11px] text-gray-400">
        <span>{formatRelative(createdAt)}</span>

        <label
          className={`
            w-5 h-5 rounded-[5px]
            inline-flex items-center justify-center
            border transition
            cursor-pointer
            ${
              isResolved
                ? "bg-[var(--brand-color)] border-[var(--brand-color)]"
                : "border-white/30 hover:border-white/70"
            }
            ${resolving ? "opacity-50 pointer-events-none" : ""}
          `}
          title={isResolved ? "Mark as unresolved" : "Mark as resolved"}
        >
          <input
            type="checkbox"
            checked={isResolved}
            onChange={onToggleResolved}
            className="sr-only"
            disabled={resolving}
          />

          {isResolved && (
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none">
              <path
                d="M3.5 8.5l3 3 6-7"
                stroke="#000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </label>
      </div>
    </div>
  );
}
