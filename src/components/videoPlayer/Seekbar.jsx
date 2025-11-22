import React, { useEffect, useRef, useState } from "react";

/**
 * SeekBar
 * Custom progress bar with:
 * - yellow played part + white unplayed
 * - draggable thumb
 * - avatar markers + vertical indicator lines
 */
export default function SeekBar({
  duration,
  currentTime,
  markers,
  onSeek, // (time: number) => void
}) {
  const barRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);

  const safeDuration = duration || 0;
  const valueTime = isDragging ? dragTime : currentTime || 0;
  const pct = safeDuration ? (valueTime / safeDuration) * 100 : 0;

  const positionForTime = (t) =>
    safeDuration ? `${(t / safeDuration) * 100}%` : "0%";

  const timeFromClientX = (clientX) => {
    if (!barRef.current || !safeDuration) return 0;
    const rect = barRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const ratio = x / rect.width;
    return ratio * safeDuration;
  };

  const handleBarClick = (e) => {
    const t = timeFromClientX(e.clientX);
    onSeek(t);
  };

  const handleThumbPointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    const t = timeFromClientX(e.clientX);
    setDragTime(t);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e) => {
      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      if (clientX == null) return;
      const t = timeFromClientX(clientX);
      setDragTime(t);
    };

    const handleUp = (e) => {
      const clientX = e.clientX ?? e.changedTouches?.[0]?.clientX;
      let finalTime = dragTime;
      if (clientX != null) {
        finalTime = timeFromClientX(clientX);
      }
      onSeek(finalTime);
      setIsDragging(false);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [isDragging, dragTime, safeDuration]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative h-10 flex items-center">
      {/* main clickable bar */}
      <div
        ref={barRef}
        className="relative w-full h-[6px] rounded-full bg-white cursor-pointer"
        onClick={handleBarClick}
      >
        {/* played portion */}
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-[#FEEA3B]"
          style={{ width: `${pct || 0}%` }}
        />

        {/* thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow border border-black"
          style={{
            left: `${pct || 0}%`,
            transform: "translate(-50%, -50%)",
          }}
          onPointerDown={handleThumbPointerDown}
          onTouchStart={handleThumbPointerDown}
        />
      </div>

      {/* avatar markers above the bar */}
      {markers.map((m) => {
        const left = positionForTime(m.time);
        return (
          <div
            key={m.id}
            className="absolute -top-6"
            style={{ left, transform: "translateX(-50%)" }}
          >
            <div className="flex flex-col items-center">
              <button
                type="button"
                className="w-7 h-7 rounded-full border-[2px] border-[#FEEA3B] overflow-hidden shadow-md"
                onClick={() => onSeek(m.time)}
              >
                <img
                  src={m.user?.avatarUrl ?? "https://i.pravatar.cc/32?u=marker"}
                  alt={m.user?.name ?? "User"}
                  className="w-full h-full object-cover"
                />
              </button>
              <div className="w-[1px] h-3 mt-1 bg-[#34d399]" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
