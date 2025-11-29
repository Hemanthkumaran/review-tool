import React, { useCallback, useRef, useState } from "react";

/**
 * markers: [
 *   { id, time, user: { avatarUrl } }
 * ]
 */
export default function CustomSeekBar({
  duration,
  currentTime,
  markers = [],
  onSeek,
}) {
  const trackRef = useRef(null);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  const seekFromEvent = useCallback(
    (clientX) => {
      if (!trackRef.current || !duration) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
      const ratio = x / rect.width;
      const t = ratio * duration;
      onSeek?.(t);
    },
    [duration, onSeek]
  );

  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsScrubbing(true);
    seekFromEvent(e.clientX);

    const move = (ev) => seekFromEvent(ev.clientX);
    const up = (ev) => {
      seekFromEvent(ev.clientX);
      setIsScrubbing(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div className="w-full">
      {/* avatars + tick markers */}
      <div className="relative mb-1 h-6">
        {duration > 0 &&
          markers.map((m) => {
            const left = `${(m.time / duration) * 100}%`;
            return (
              <div
                key={m.id}
                className="absolute -translate-x-1/2 flex flex-col items-center"
                style={{ left }}
              >
                <div onClick={() => onSeek(m.time)} className="cursor-pointer w-[18px] h-[18px] rounded-full overflow-hidden border-[1.5px] border-[#0b0c0e] shadow">
                  <img
                    src={m.user?.avatarUrl}
                    alt={m.user?.name || "marker"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-[2px] w-[2px] h-2 bg-[#37D37D]" />
              </div>
            );
          })}
      </div>

      {/* track */}
      <div
        ref={trackRef}
        className="relative h-[8px] rounded-full bg-[#2b2b2f] cursor-pointer"
        onPointerDown={handlePointerDown}
      >
        {/* played portion */}
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-[#FEEA3B]"
          style={{ width: `${pct}%` }}
        />

        {/* knob */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full bg-white shadow-md"
          style={{ left: `calc(${pct}% - 7px)` }}
        />
      </div>
    </div>
  );
}
