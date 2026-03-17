import { useEffect, useRef } from "react";

export default function ProjectFilter({ filters = { assignment: null, status: [] }, onChange, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const isAllActive =
    !filters.assignment && filters.status.length === 0;

  const setAssignment = (value) => {
    onChange({
      ...filters,
      assignment: value,
    });
  };

  const toggleStatus = (value) => {
    onChange({
      ...filters,
      status: filters.status.includes(value)
        ? filters.status.filter((x) => x !== value)
        : [...filters.status, value],
    });
  };

  const clearAll = () => {
    onChange({ assignment: null, status: [] });
  };

  const Check = ({ active }) => (
    <span
      className={`w-4 h-4 rounded border border-[#3A3A3A] flex items-center justify-center
        ${active ? "bg-[#F9EF38] border-[#F9EF38]" : ""}`}
    >
      {active && (
        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5">
          <path
            d="M3.5 8.5l3 3 6-7"
            stroke="#000"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );

  return (
    <div
      ref={ref}
      className="absolute right-0 top-9 z-40 w-56 rounded-2xl bg-[#0F1011]
                 border border-[#232427] shadow-[0_12px_40px_rgba(0,0,0,0.6)] p-2"
    >
      {/* All */}
      <button
        onClick={clearAll}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl
                   text-sm text-[#D1D5DB] hover:bg-white/5"
      >
        <Check active={isAllActive} />
        All
      </button>

      <div className="my-2 h-px bg-[#1F1F1F]" />

      {/* Assignment */}
      {[
        { label: "Assigned", value: "assigned" },
        { label: "Unassigned", value: "unassigned" },
      ].map((item) => (
        <button
          key={item.value}
          onClick={() => setAssignment(item.value)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl
                     text-sm text-[#D1D5DB] hover:bg-white/5"
        >
          <Check active={filters.assignment === item.value} />
          {item.label}
        </button>
      ))}

      <div className="my-3 h-px bg-[#1F1F1F]" />

      {/* Status Header */}
      <div className="px-3 py-1 text-xs text-[#9CA3AF] uppercase">
        Status
      </div>

      {[
        { label: "Yet to start", value: "yet_to_start" },
        { label: "In progress", value: "in_progress" },
        { label: "Internal review", value: "internal_review" },
        { label: "Client review", value: "client_review" },
        { label: "Approved", value: "approved" },
      ].map((item) => (
        <button
          key={item.value}
          onClick={() => toggleStatus(item.value)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl
                     text-sm text-[#D1D5DB] hover:bg-white/5"
        >
          <Check active={filters.status.includes(item.value)} />
          {item.label}
        </button>
      ))}
    </div>
  );
}
