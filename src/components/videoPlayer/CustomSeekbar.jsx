import { useCallback, useState } from "react";
import { formatClockTime2, getInitials } from "../../helpers/common";
import { getTimeFromMarker, normalizeVideoFps, snapTimeToFrame } from "../../helpers/videoFrames";


function getMuxThumbnail(playbackId, time) {
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?time=${Math.floor(
    time
  )}&width=320`;
}

export default function CustomSeekBar({
  currentTime = 0,
  duration = 0,
  onSeek,
  markers = [],
  playbackId,
  videoFps,
  showMarkers = true
}) {
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverX, setHoverX] = useState(0);
  const fps = normalizeVideoFps(videoFps);
  
  const safeDuration =
    Number.isFinite(duration) && duration > 0 ? duration : 0;

  const pct = safeDuration ? Math.min(currentTime / safeDuration, 1) : 0;

  const handleMouseMove = (e) => {
    if (!safeDuration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.min(Math.max(x / rect.width, 0), 1);
    const t = snapTimeToFrame(ratio * safeDuration, fps, safeDuration);

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
      onSeek?.(snapTimeToFrame(ratio * safeDuration, fps, safeDuration));
    },
    [fps, onSeek, safeDuration]
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
        onSeek?.(snapTimeToFrame(ratio * safeDuration, fps, safeDuration));
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
    [fps, onSeek, safeDuration]
  );

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
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* PROGRESS */}
        <div
          className="absolute left-0 top-0 h-2 rounded-full bg-[var(--brand-color)]"
          style={{ width: `${pct * 100}%` }}
        />

        {/* THUMB */}
        <div
          className="absolute top-1/2 w-4 h-4 rounded-full bg-white shadow z-[100]"
          style={{
            left: `${pct * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
          onPointerDown={handleDragThumb}
        />
      </div>

      {/* MARKERS */}
      <div className="absolute inset-x-0 top-6.5 h-10 pointer-events-none">
        {!showMarkers && markers.length > 0 && (
        <div className="absolute left-1/2 top-2 -translate-x-1/2 h-2 w-24 rounded-full bg-white/10 animate-pulse" />
      )}
      {showMarkers && safeDuration > 0 && markers.map((m) => {
          const markerTime = getTimeFromMarker(m, fps, safeDuration);
          const leftPct = (markerTime / safeDuration) * 100;

          return (
              <button
                key={m.id}
                type="button"
                className="pointer-events-auto absolute flex flex-col items-center"
                style={{
                  left: `${leftPct}%`,
                  transform: "translateX(-50%)",
                }}
                onClick={() => onSeek?.(markerTime)}
              >
              <div  className="w-4 h-4 rounded-full border border-[var(--brand-color)] overflow-hidden bg-black mb-[6px]">
                { m.user?.avatarUrl ? 
                <img
                  src={m.user?.avatarUrl}
                  className="w-full h-full object-cover cursor-pointer"
                /> :
                <div className="flex align-items justify-center" style={{ color:"#fff", zIndex:100, fontSize:8 }}>{getInitials(m?._raw?.userData.firstName, "")}</div> }
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
              style={{ objectFit:'contain' }}
              className="w-full h-20"
            />
            <div className="text-[11px] text-center text-white py-1 bg-black/70">
              {formatClockTime2(hoverTime, fps)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
