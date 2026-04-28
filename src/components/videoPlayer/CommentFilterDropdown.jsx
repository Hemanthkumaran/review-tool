import { useEffect, useRef } from "react";
import { constants } from "../../helpers/enum";
import { useWorkspace } from "../../context/WorkspaceContext";


export default function CommentFilterDropdown({
  selected = [],
  onChange,
  onClose,
   triggerRef,
}) {
  const ref = useRef(null);
  const { ownerWorkspacePlan } = useWorkspace();
  const subscription = ownerWorkspacePlan?.subscription?.activePlan;
  const filterOptions = [
    {
      label: "Team",
      value: constants.MEMBER,
    },
    {
      label: "Collaborator",
      value: constants.COLLABORATOR,
    },
    {
      label: "Reviewer",
      value: constants.REVIEWER,
    },
  ].filter((item) => {
    if (subscription === "team" && item.value === constants.COLLABORATOR) {
      return false;
    }

    return true;
  });

  useEffect(() => {
    const handler = (e) => {
      if (
        ref.current?.contains(e.target) ||
        triggerRef?.current?.contains(e.target)
      ) {
        return;
      }
      onClose();
    };

    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [onClose, triggerRef]);

  const toggle = (value) => {
    
    if (selected.includes(value)) {
      onChange(selected.filter((x) => x !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div
      ref={ref}
      className="
        absolute right-0 top-9 z-40
        w-52 rounded-2xl
        bg-[#0F1011]
        border border-[#232427]
        shadow-[0_12px_40px_rgba(0,0,0,0.6)]
        p-2
      "
    >
      {filterOptions.map((item) => (
        <button
          key={item.value}
          onClick={() => toggle(item.value)}
          className="
            w-full flex items-center gap-3
            px-3 py-2 rounded-xl
            text-sm text-[#D1D5DB]
            hover:bg-white/5 cursor-pointer
          "
        >
          <span
            className={`
              w-4 h-4 rounded
              border border-[#3A3A3A]
              flex items-center justify-center
              ${selected.includes(item.value)
                ? "bg-[var(--brand-color)] border-[var(--brand-color)]"
                : ""}
            `}
          >
            {selected.includes(item.value) && (
              <svg
                viewBox="0 0 16 16"
                className="w-3.5 h-3.5"
                fill="none"
              >
                <path
                  d="M3.5 8.5l3 3 6-7"
                  stroke="#000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
          {item.label}
        </button>
      ))}
    </div>
  );
}
