import { X, Check } from "lucide-react";

const TOAST_STYLES = {
  success: {
    icon: <Check size={20} strokeWidth={2.5} />,
    color: "#F9EF38",
    glow: "rgba(249, 239, 56, 0.18)",
  },
  error: {
    icon: <X size={20} strokeWidth={2.5} />,
    color: "#FF3B3B",
    glow: "rgba(255, 59, 59, 0.18)",
  },
};

export default function SuccessToast({ message, closeToast, variant = "success" }) {
  const styles = TOAST_STYLES[variant] || TOAST_STYLES.success;

  return (
    <div
      className="
        flex items-center gap-4
        px-5 py-4
        rounded-full
        bg-black
        border border-[#1e1f22]
        shadow-[0_20px_60px_rgba(0,0,0,0.8)]
        w-[min(calc(100vw-32px),720px)] sm:min-w-[520px]
      "
    >
      {/* Icon */}
      <div className="relative flex items-center justify-center">
        <div
          className="absolute h-7 w-7 rounded-full"
          style={{ backgroundColor: styles.glow }}
        />
        <div
          className="relative flex h-5 w-5 items-center justify-center rounded-full border-2"
          style={{ borderColor: styles.color, color: styles.color }}
        >
          {styles.icon}
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 text-white text-[16px] leading-snug font-[Gilroy-Light]">
        {message}
      </div>

      {/* Close */}
      <button
        onClick={closeToast}
        className="
          ml-2 flex h-5 w-5 items-center justify-center
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
