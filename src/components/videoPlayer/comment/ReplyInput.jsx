export default function ReplyInput({
  value,
  onChange,
  onSubmit,
  onCancel,
  onKeyDown,
  sending,
  placeholder = "Write a reply...",
}) {
  return (
    <div className="mt-3">
      <textarea
        className="
          w-full bg-[#101213] border border-[#1F1F21]
          rounded-2xl px-3 py-2 text-[13px]
          outline-none placeholder-[#58595A]
          resize-none min-h-[60px]
        "
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
      />

      <div className="mt-2 flex justify-end gap-2 text-[11px]">
        <button
          type="button"
          onClick={onCancel}
          className="
            px-3 py-[4px] rounded-full
            cursor-pointer border border-[#2a2b2e]
            bg-[#111216] text-gray-200
            hover:bg-[#18191d]
          "
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={sending || !value.trim()}
          className="
            px-4 py-[4px] rounded-full
            bg-[var(--brand-color)] text-black font-medium
            disabled:opacity-40 disabled:cursor-default
          "
        >
          {sending ? "Sending…" : "Reply"}
        </button>
      </div>
    </div>
  );
}
