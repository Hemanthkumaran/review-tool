// src/components/common/AppLoader.jsx
import React from "react";

const spinnerBase =
  "inline-block w-6 h-6 border-2 border-transparent rounded-full animate-spin";

const yellow = "#FEEA3B";

export default function AppLoader({
  visible = false,
  message = "Loading…",
  variant = "overlay", // "overlay" | "inline"
  className = "",
}) {
  if (!visible) return null;

  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span
          className={spinnerBase}
          style={{
            borderTopColor: yellow,
            borderRightColor: yellow,
            borderBottomColor: "transparent",
            borderLeftColor: "transparent",
          }}
        />
        {message && (
          <span className="text-xs text-gray-300 tracking-wide">
            {message}
          </span>
        )}
      </div>
    );
  }

  // overlay variant
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      {/* dim / blur background */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* loader card */}
      <div className="relative z-[71] min-w-[220px] max-w-[320px] rounded-3xl border border-white/10 bg-[#111214] px-6 py-5 shadow-[0_18px_45px_rgba(0,0,0,0.7)] flex flex-col items-center gap-3">
        <span
          className={`${spinnerBase}`}
          style={{
            width: "32px",
            height: "32px",
            borderWidth: "3px",
            borderTopColor: yellow,
            borderRightColor: yellow,
            borderBottomColor: "transparent",
            borderLeftColor: "transparent",
          }}
        />
        {message && (
          <div className="text-[13px] text-gray-100 tracking-wide text-center">
            {message}
          </div>
        )}
        <div className="text-[11px] text-gray-500">
          Please wait a moment…
        </div>
      </div>
    </div>
  );
}
