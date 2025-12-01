// VoiceNotePlayer.jsx
import React, { useEffect, useRef, useState } from "react";

function formatClockTime(t = 0) {
  const sec = Math.floor(t % 60)
    .toString()
    .padStart(2, "0");
  const min = Math.floor(t / 60)
    .toString()
    .padStart(2, "0");
  return `${min}:${sec}`;
}

export default function VoiceNotePlayer({ src }) {
  const audioRef = useRef(null);
  const barRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  // Attach audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoaded = () => {
      setDuration(audio.duration || 0);
    };

    const handleTimeUpdate = () => {
      if (!isSeeking) {
        setCurrentTime(audio.currentTime || 0);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [isSeeking]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const seekToClientX = (clientX) => {
    const audio = audioRef.current;
    const bar = barRef.current;
    if (!audio || !bar || !duration) return;

    const rect = bar.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const ratio = x / rect.width;
    const newTime = ratio * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleBarPointerDown = (e) => {
    e.preventDefault();
    setIsSeeking(true);
    seekToClientX(e.clientX);

    const handleMove = (moveEvent) => {
      moveEvent.preventDefault();
      seekToClientX(moveEvent.clientX);
    };

    const handleUp = (upEvent) => {
      upEvent.preventDefault();
      setIsSeeking(false);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  };

  const progressPct =
    duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  return (
    <div className="flex items-center gap-4">
      {/* hidden native audio element */}
      <audio ref={audioRef} src={src} className="hidden" />

      {/* Play / pause circle */}
      <button
        type="button"
        onClick={togglePlay}
        className="flex items-center justify-center w-11 h-11 rounded-full border border-[#222327] bg-black/80 hover:bg-black transition-colors"
      >
        {isPlaying ? (
          // Pause icon
          <div className="flex items-center gap-[3px]">
            <span className="w-[4px] h-5 rounded-full bg-white" />
            <span className="w-[4px] h-5 rounded-full bg-white" />
          </div>
        ) : (
          // Play triangle
          <div
            className="w-0 h-0"
            style={{
              borderTop: "10px solid transparent",
              borderBottom: "10px solid transparent",
              borderLeft: "14px solid white",
              marginLeft: "2px",
            }}
          />
        )}
      </button>

      {/* Progress bar */}
      <div
        className="flex-1 relative cursor-pointer"
        ref={barRef}
        onPointerDown={handleBarPointerDown}
      >
        <div className="w-full h-[10px] rounded-full bg-[#202124]" />
        {/* filled portion */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-[10px] rounded-full bg-[#F9F046]"
          style={{ width: `${progressPct}%` }}
        />
        {/* thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-md"
          style={{ left: `calc(${progressPct}% - 10px)` }}
        />
      </div>

      {/* Time pill */}
      <div className="px-4 py-[6px] rounded-full bg-[#101114] text-[12px] text-gray-100 font-medium min-w-[64px] text-center">
        {formatClockTime(currentTime)}
      </div>
    </div>
  );
}
