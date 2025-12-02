// src/components/common/UploadFrameLoader.jsx
import React from "react";

export default function UploadFrameLoader({
  progress = 0,          // 0–100
  label = "Uploading",
  className = "",
}) {
  // keep a tiny minimum width so it never looks empty
  const fillWidth = Math.max(progress, 8);

  return (
    <div
      className={
        "w-[260px] h-[120px] rounded-2xl border border-white/10 bg-[#101113] flex items-center justify-center " +
        className
      }
    >
      <div className="relative w-[92%] h-[80%] rounded-2xl border border-white/8 bg-[#111214] overflow-hidden">
        {/* left fill bar */}
        <div
          className="absolute inset-y-0 left-0 bg-[#5e6132]"
          style={{ width: `${fillWidth}%` }}
        />
        {/* centered text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[13px] text-white">{label}</span>
        </div>
      </div>
    </div>
  );
}
