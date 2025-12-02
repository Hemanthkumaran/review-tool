// src/components/videoPlayer/CustomSeekBar.jsx
import React, { useCallback } from "react";

export default function CustomSeekBar({
  currentTime = 0,
  duration = 0,
  onSeek,
  markers = [],
}) {
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const pct = safeDuration ? Math.min(currentTime / safeDuration, 1) : 0;

  const handleClickTrack = useCallback(
    (e) => {
      if (!safeDuration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = Math.min(Math.max(x / rect.width, 0), 1);
      const newTime = ratio * safeDuration;
      onSeek?.(newTime);
    },
    [onSeek, safeDuration]
  );

  const handleDragThumb = useCallback(
    (e) => {
      if (!safeDuration) return;

      const track = e.currentTarget.parentElement;
      if (!track) return;
      const rect = track.getBoundingClientRect();

      const updateFromEvent = (ev) => {
        const x = ev.clientX - rect.left;
        const ratio = Math.min(Math.max(x / rect.width, 0), 1);
        const newTime = ratio * safeDuration;
        onSeek?.(newTime);
      };

      const move = (ev) => {
        ev.preventDefault();
        updateFromEvent(ev);
      };

      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);

      updateFromEvent(e);
    },
    [onSeek, safeDuration]
  );

  return (
    <div className="relative w-full h-14">
      {/* track + progress + thumb (bottom-aligned) */}
      <div
        className="absolute left-0 right-0 bottom-0 h-2 rounded-full bg-[#252525] cursor-pointer"
        onClick={handleClickTrack}
      >
        {/* filled yellow portion */}
        <div
          className="absolute left-0 top-0 h-2 rounded-full bg-[#FEEA3B]"
          style={{ width: `${pct * 100}%` }}
        />

        {/* thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/14 w-4 h-4 rounded-full bg-white shadow pointer-events-auto"
          style={{ left: `${pct * 100}%`, transform: "translate(-50%, -50%)", zIndex:1000000 }}
          onPointerDown={handleDragThumb}
        />
      </div>

      {/* marker avatars + green ticks */}
      <div className="absolute inset-x-0 top-6.5 h-10 pointer-events-none">
        {markers.map((m) => {
          const leftPct = safeDuration ? (m.time / safeDuration) * 100 : 0;
          const avatar =
            m.user?.avatarUrl ||
            "https://i.pravatar.cc/40?u=default-marker";
          return (
            <button
              key={m.id}
              type="button"
              className="pointer-events-auto absolute flex flex-col items-center -translate-x-1/2"
              style={{ left: `${leftPct}%` }}
              onClick={() => onSeek?.(m.time)}
            >
              {/* avatar above */}
              <div className="w-4 h-4 cursor-pointer rounded-full border border-[#FEEA3B] overflow-hidden bg-black mb-[3px]">
                <img
                  src={avatar}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              {/* green tick touching the track */}
              <div className="w-[2px] h-2 bg-[#27C46A] mt-0.5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
