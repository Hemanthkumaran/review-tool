import React from "react";
import { createPortal } from "react-dom";

import confetti from "../../assets/svgs/confetti.svg"

export default function FreeTrialModal({
  open = false,
  onClose = () => {},
  onStart = () => {},
}) {
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm rounded-[20px] bg-[#151619] text-white border border-[#24262A] shadow-[0_10px_30px_rgba(0,0,0,0.35)] overflow-hidden">
        {/* subtle inner glow / vignette */}
        <div className="pointer-events-none absolute inset-0 rounded-[20px] bg-[radial-gradient(120%_80%_at_50%_-20%,rgba(255,255,255,0.06),rgba(0,0,0,0)_55%)]" />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3.5 top-3.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#202226] text-white/70 hover:text-white"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Content */}
        <div className="relative px-6 pt-8 pb-6 text-center">
          {/* Icon badge */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#202226]">
            <img src={confetti}/>
          </div>

          {/* Title */}
          <h2 className="text-lg sm:text-xl font-semibold">
            Enjoy your <span className="font-semibold">free trial</span>!
          </h2>

          {/* Subtitle */}
          <p className="mt-3 text-sm text-[#BFBFBF]">
            To access your projects and continue using the application
            <br className="hidden sm:block" /> please upgrade
          </p>

          {/* CTA */}
          <button
            onClick={onStart}
            className="mt-6 w-full rounded-full bg-[#F9EF38] px-6 py-3 text-sm font-medium text-black hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#F9EF38]/40"
          >
            Start using
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
