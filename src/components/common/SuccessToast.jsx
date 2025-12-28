import { X, Check } from "lucide-react";

export default function SuccessToast({ message, closeToast }) {
  return (
    <div
      className="
        flex items-center gap-4
        px-6 py-4
        rounded-full
        bg-black
        border border-[#1e1f22]
        shadow-[0_20px_60px_rgba(0,0,0,0.8)]
        min-w-[520px]
      "
    >
      {/* Icon */}
      <div className="relative flex items-center justify-center">
        <div className="absolute h-14 w-14 rounded-full bg-[#F9EF38]/20" />
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#F9EF38] text-[#F9EF38]">
          <Check size={20} strokeWidth={2.5} />
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 text-white text-lg">
        {message}
      </div>

      {/* Close */}
      <button
        onClick={closeToast}
        className="
          ml-2 flex h-10 w-10 items-center justify-center
          rounded-full
          border border-[#2a2b2f]
          text-white/70
          hover:text-white
        "
      >
        <X size={18} />
      </button>
    </div>
  );
}
