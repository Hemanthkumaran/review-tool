import { formatClockTime, formatRelative } from "../../../helpers/common";

export default function CommentHeader({
  time,
  index,
  createdAt,
  isResolved,
  resolving,
  sNo,
  // onGo,
  onToggleResolved,
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      {/* Left */}
      <div className="flex items-center gap-2 text-[14px]">
        <span
          // onClick={onGo}
          className="text-[#F9F046] cursor-pointer"
        >
          {formatClockTime(time)}
        </span>
        <span className="text-gray-400">•</span>
        <span className="text-gray-300">#{sNo + 1}</span>
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
                ? "bg-[#FEEA3B] border-[#FEEA3B]"
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
