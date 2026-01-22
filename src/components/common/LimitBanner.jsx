function UsageLimitWarning({ currentUsage }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-red-500/40 bg-gradient-to-b from-black/60 to-black/90 px-5 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
      {/* Icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-500/60 bg-red-500/15 text-lg font-bold text-red-500">
        ×
      </div>

      {/* Text */}
      <p className="text-sm leading-relaxed text-gray-100">
        You cannot set a limit lower than your current usage of{" "}
        <span className="font-semibold text-white">
          {currentUsage} minutes
        </span>
        .
      </p>
    </div>
  );
}

export default UsageLimitWarning;
