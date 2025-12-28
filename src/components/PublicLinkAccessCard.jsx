import { CopyIcon, ShareLinkIcon } from "../assets/svgs/SvgComponents";

export default function PublicLinkAccessCard({
  link,
  passwordRequired,
  onTogglePassword,
  onCopy,
}) {
  return (
    <div className="w-full rounded-[28px] px-6 py-0 flex flex-col gap-5">
      {/* Top row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* icon */}
          <div className="w-12 h-12 rounded-2xl bg-[#111214] border border-[#1F2023] flex items-center justify-center">
            <ShareLinkIcon color={"#BFBFBF"}/>
          </div>

          {/* text */}
          <div>
            <div className="text-[15px] font-medium">
              Anyone with the link
            </div>
            <div className="text-[13px] text-white/50 mt-0.5">
              {link}
            </div>
          </div>
        </div>

        {/* copy button */}
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
            <CopyIcon color="#BFBFBF"/>
          <span className="text-sm">Copy link</span>
        </button>
      </div>

      {/* Password row */}
      <div className="flex items-center gap-3">
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
            <svg viewBox="0 0 16 16" className="w-4 h-4">
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
          password required
        </span>
      </div>
    </div>
  );
}
