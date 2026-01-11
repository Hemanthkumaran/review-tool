import { useEffect, useRef } from "react";


export default function CommentFilterDropdown({
  selected = [],
  onChange,
  onClose,
}) {
  const ref = useRef(null);

  // close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

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
      {[
          {
            label: "Team",
            value: "team only",
          },
          {
            label: "Reviewer",
            value: "reviewer only",
          },
          {
            label: "Client",
            value: "everyone",
          }
      ].map((item) => (
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
                ? "bg-[#F9EF38] border-[#F9EF38]"
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
