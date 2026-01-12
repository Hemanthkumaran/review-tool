import { useEffect, useRef, useState } from "react";
import arrowDown from "../assets/svgs/arrow-down.svg";
import { useWorkspace } from "../context/WorkspaceContext";
import { constants } from "../helpers/enum";

const ownerOptions = [
  { value: "everyone", label: "Everyone" },
  { value: "reviewer only", label: "Reviewer only" },
  { value: "team only", label: "Team only" },
];

const teamMemberOptions = [
  { value: "everyone", label: "Everyone" },
  { value: "team only", label: "Team only" },
];

const collaboratorOptions = [
  { value: "team only", label: "Team only" },
];

const reviewerOptions = [
  { value: "everyone", label: "Everyone" },
];

export default function AudienceSelect({
  value,
  onChange = () => {},
}) {

  const {
    userAccess
  } = useWorkspace();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const OPTIONS = userAccess == constants.OWNER ? ownerOptions : userAccess == constants.MEMBER ? teamMemberOptions : userAccess == constants.REVIEWER ? reviewerOptions : collaboratorOptions;
      
  const active = OPTIONS.find((o) => o.value == value);

  // close on outside click
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
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-[6px] rounded-full bg-[#282A2B] text-[11px] text-gray-200"
      >
        {active?.label}
        <img src={arrowDown} className="w-3 h-3 opacity-80" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-[-88px] left-0 z-50 w-[180px] cursor-pointer rounded-2xl bg-[#1A1A1A] shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden">
          {OPTIONS.map((opt) => {
            const isActive = opt.value === value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`relative w-full px-6 py-2 cursor-pointer text-left text-sm transition
                  ${isActive ? "text-[#FEEA3B]" : "text-gray-300 hover:text-white"}
                `}
              >
                {opt?.label}

                {/* underline for active */}
                {isActive && (
                  <span className="absolute left-6 right-6 bg-[#FEEA3B]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
