// src/components/videoPlayer/CustomSeekBar.jsx
import React, { useCallback, useState } from "react";
import { formatClockTime } from "../../helpers/common";


function getMuxThumbnail(playbackId, time) {
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?time=${Math.floor(
    time
  )}&width=320`;
}

/* ---------- component ---------- */

export default function CustomSeekBar({
  currentTime = 0,
  duration = 0,
  onSeek,
  markers = [],
  playbackId, // ✅ REQUIRED
}) {
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverX, setHoverX] = useState(0);

  const safeDuration =
    Number.isFinite(duration) && duration > 0 ? duration : 0;

  const pct = safeDuration ? Math.min(currentTime / safeDuration, 1) : 0;

  /* ---------- hover logic ---------- */

  const handleMouseMove = (e) => {
    if (!safeDuration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.min(Math.max(x / rect.width, 0), 1);
    const t = ratio * safeDuration;

    setHoverTime(t);
    setHoverX(x);
  };

  const handleMouseLeave = () => {
    setHoverTime(null);
  };

  /* ---------- click ---------- */

  const handleClickTrack = useCallback(
    (e) => {
      if (!safeDuration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = Math.min(Math.max(x / rect.width, 0), 1);
      onSeek?.(ratio * safeDuration);
    },
    [onSeek, safeDuration]
  );

  /* ---------- drag ---------- */

  const handleDragThumb = useCallback(
    (e) => {
      if (!safeDuration) return;

      const track = e.currentTarget.parentElement;
      if (!track) return;

      const rect = track.getBoundingClientRect();

      const update = (ev) => {
        const x = ev.clientX - rect.left;
        const ratio = Math.min(Math.max(x / rect.width, 0), 1);
        onSeek?.(ratio * safeDuration);
      };

      const move = (ev) => {
        ev.preventDefault();
        update(ev);
      };

      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);

      update(e);
    },
    [onSeek, safeDuration]
  );

  /* ---------- thumbnail positioning ---------- */

  const thumbLeft = Math.min(
    Math.max(hoverX - 80, 0),
    window.innerWidth - 160
  );

  return (
    <div className="relative w-full h-14">
      {/* TRACK */}
      <div
        className="absolute left-0 right-0 bottom-0 h-2 rounded-full bg-[#252525] cursor-pointer"
        onClick={handleClickTrack}
        onMouseMove={handleMouseMove}   // ✅ ATTACHED
        onMouseLeave={handleMouseLeave} // ✅ ATTACHED
      >
        {/* PROGRESS */}
        <div
          className="absolute left-0 top-0 h-2 rounded-full bg-[#FEEA3B]"
          style={{ width: `${pct * 100}%` }}
        />

        {/* THUMB */}
        <div
          className="absolute top-1/2 w-4 h-4 rounded-full bg-white shadow"
          style={{
            left: `${pct * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
          onPointerDown={handleDragThumb}
        />
      </div>

      {/* MARKERS */}
      <div className="absolute inset-x-0 top-6.5 h-10 pointer-events-none">
        {markers.map((m) => {
          const leftPct = safeDuration
            ? (m.time / safeDuration) * 100
            : 0;

          return (
            <button
              key={m.id}
              type="button"
              className="pointer-events-auto absolute -translate-x-1/2"
              style={{ left: `${leftPct}%` }}
              onClick={() => onSeek?.(m.time)}
            >
              <div className="w-4 h-4 rounded-full border border-[#FEEA3B] overflow-hidden bg-black mb-[3px]">
                <img
                  src={
                    m.user?.avatarUrl ||
                    "https://i.pravatar.cc/40?u=default-marker"
                  }
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-[2px] h-2 bg-[#27C46A]" />
            </button>
          );
        })}
      </div>

      {/* HOVER THUMBNAIL */}
      {hoverTime != null && playbackId && (
        <div
          className="absolute bottom-8 z-50 pointer-events-none"
          style={{ left: thumbLeft }}
        >
          <div className="w-[160px] rounded-lg overflow-hidden bg-black shadow-xl">
            <img
              src={getMuxThumbnail(playbackId, hoverTime)}
              className="w-full h-auto"
            />
            <div className="text-[11px] text-center text-white py-1 bg-black/70">
              {formatClockTime(hoverTime)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
