import { useEffect, useState } from "react";
import { CopyIcon, ShareLinkIcon } from "../assets/svgs/SvgComponents";

export default function PublicLinkAccessCard({
  link,
  passwordRequired,
  onTogglePassword,
  onCopy,
  onSavePassword, // 🔐 NEW
}) {
  const [password, setPassword] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!password) return;
    await onSavePassword?.(password);
    setSaved(true);
    setPassword("");
  };

  // auto-hide "Saved"
  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(t);
  }, [saved]);

  return (
    <div className="w-full rounded-[28px] px-6 py-0 flex flex-col gap-5">
      {/* Top row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#111214] border border-[#1F2023] flex items-center justify-center">
            <ShareLinkIcon color="#BFBFBF" />
          </div>

          <div>
            <div className="text-[15px] font-medium">
              Anyone with the link
            </div>
            <div className="text-[13px] text-white/50 mt-0.5">
              {link}
            </div>
          </div>
        </div>

        <button
          onClick={onCopy}
          className="
            flex items-center gap-3
            px-6 py-3 rounded-full
            border border-[#2A2B2F]
            bg-[#0F1011]
            hover:bg-white/5
            transition
            cursor-pointer
          "
        >
          <CopyIcon color="#BFBFBF" />
          <span className="text-sm">Copy link</span>
        </button>
      </div>

      {/* Password toggle */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={onTogglePassword}
          className={`
            w-6 h-6 rounded-md
            border border-[#2A2B2F]
            flex items-center justify-center
            cursor-pointer
            ${passwordRequired ? "bg-[#F9EF38] border-[#F9EF38]" : ""}
          `}
        >
          {passwordRequired && (
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
        </button>

        <span className="text-sm text-white/60">
          Password required
        </span>
      </div>

      {/* Password input + save */}
      {passwordRequired && (
        <div style={{ marginTop: -15}} className="flex items-center gap-4 mb-2">
          <input
            // type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="
              flex-1 px-5 py-3
              rounded-full
              bg-[#0F1011]
              border border-[#2A2B2F]
              outline-none
              text-sm
              placeholder-white/30
            "
          />

          <button
            onClick={handleSave}
            disabled={!password}
            className="
              px-10 py-3
              rounded-full
              bg-[#F9EF38]
              text-black
              font-medium
              disabled:opacity-40
              cursor-pointer
            "
          >
            Save
          </button>
        </div>
      )}

      {/* Saved state */}
      {saved && (
        <div className="flex justify-center">
          <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-[#1B1C1E]">
            <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
              <svg viewBox="0 0 16 16" className="w-4 h-4">
                <path
                  d="M3.5 8.5l3 3 6-7"
                  stroke="#000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-sm">Saved</span>
          </div>
        </div>
      )}
    </div>
  );
}
