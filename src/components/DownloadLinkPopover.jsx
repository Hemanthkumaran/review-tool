import React, { useEffect, useRef, useState } from "react";

export default function FinalLinkPopover({
  open,
  onClose,
  onSave, // async (link) => Promise
  initialValue = "",
  title = "Add your final video link here"
}) {
  const ref = useRef(null);
  const [link, setLink] = useState(initialValue);
  const [saving, setSaving] = useState(false);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) onClose?.();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleSave = async () => {
    if (!link.trim() || saving) return;

    try {
      setSaving(true);
      await onSave(link.trim());
      onClose?.();
    } catch (err) {
      console.error("Failed to save link", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      ref={ref}
      className="
        absolute right-0 top-12 z-50 w-[350px]
        rounded-3xl
        bg-[#0B0B0C]
        border border-[#1F2023]
        shadow-[0_20px_60px_rgba(0,0,0,0.65)]
        p-5
      "
    >
      {/* Title */}
      <div className="text-[16px] text-gray-200 mb-4">
        {title}
      </div>

      {/* Input */}
      <input
        type="text"
        placeholder="paste link here"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        className="
          w-full
          bg-[#101114]
          border border-[#1F2023]
          rounded-2xl
          px-4 py-3
          text-[14px]
          text-gray-200
          placeholder-gray-500
          outline-none
          focus:border-[#FEEA3B]/60
        "
      />

      {/* Actions */}
      <div className="flex items-center justify-between mt-6">
        <button
          type="button"
          onClick={() => setLink("")}
          className="
            px-6 py-1.5
            rounded-full w-full
            border border-[#2A2B2E]
            bg-[#111216]
            text-gray-300
            hover:bg-[#18191d] mr-2
          "
        >
          Clear
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={!link.trim() || saving}
          className="
            px-10 py-1.5 w-full
            rounded-full
            bg-[#FDF45C]
            text-black
            font-medium
            disabled:opacity-40
            disabled:cursor-not-allowed
          "
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
