// src/components/videoPlayer/PlayerControlsBar.jsx
import React from "react";
import CustomSeekBar from "./CustomSeekBar";

function formatClockTime(t = 0) {
  const sec = Math.floor(t % 60)
    .toString()
    .padStart(2, "0");
  const min = Math.floor(t / 60)
    .toString()
    .padStart(2, "0");
  return `${min}:${sec}`;
}

const IconButton = ({ onClick, title, children, active }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 ${
      active ? "text-[#FEEA3B]" : "text-gray-200"
    }`}
  >
    {children}
  </button>
);

const PlayIcon = ({ playing }) =>
  playing ? (
    <svg viewBox="0 0 16 16" className="w-[13px] h-[13px]" fill="currentColor">
      <rect x="3" y="3" width="3" height="10" rx="1" />
      <rect x="10" y="3" width="3" height="10" rx="1" />
    </svg>
  ) : (
    <svg viewBox="0 0 16 16" className="w-[13px] h-[13px]" fill="currentColor">
      <path d="M4 3.5v9l8-4.5-8-4.5z" />
    </svg>
  );

const LoopIcon = () => (
  <svg viewBox="0 0 20 20" className="w-[16px] h-[16px]" fill="none">
    <path
      d="M5 5h8.5a3.5 3.5 0 0 1 0 7H5"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 3.5 5 5l2 1.5M13 16.5 15 15l-2-1.5"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const VolumeIcon = ({ muted }) =>
  muted ? (
    <svg viewBox="0 0 20 20" className="w-[16px] h-[16px]" fill="none">
      <path
        d="M4 8h3l4-3v10l-4-3H4z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 8l3 3m0-3-3 3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" className="w-[16px] h-[16px]" fill="none">
      <path
        d="M4 8h3l4-3v10l-4-3H4z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 8.5a2 2 0 0 1 0 3M15.5 7a4 4 0 0 1 0 6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );

const FullscreenIcon = () => (
  <svg viewBox="0 0 20 20" className="w-[16px] h-[16px]" fill="none">
    <path
      d="M4 9V4h5M16 11v5h-5M11 4h5v5M9 16H4v-5"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function PlayerControlsBar({
  duration,
  currentTime,
  markers,
  isPlaying,
  onTogglePlay,
  onSeek,
  onToggleLoop,
  isLooping,
  onToggleMute,
  isMuted,
  qualityLabel = "1080p",
  onFullscreen,
}) {
  return (
    <div className="px-6 pb-4 pt-3">
      {/* seek bar with markers */}
      <CustomSeekBar
        duration={duration}
        currentTime={currentTime}
        markers={markers}
        onSeek={onSeek}
      />

      {/* controls row */}
      <div className="mt-3 flex items-center justify-between text-[13px] text-gray-200">
        {/* left cluster */}
        <div className="flex items-center gap-3">
          <IconButton
            onClick={onTogglePlay}
            title={isPlaying ? "Pause" : "Play"}
          >
            <PlayIcon playing={isPlaying} />
          </IconButton>

          <IconButton
            onClick={onToggleLoop}
            title="Loop"
            active={isLooping}
          >
            <LoopIcon />
          </IconButton>

          <IconButton
            onClick={onToggleMute}
            title={isMuted ? "Unmute" : "Mute"}
            active={isMuted}
          >
            <VolumeIcon muted={isMuted} />
          </IconButton>
        </div>

        {/* center time */}
        <div className="min-w-[120px] text-center tracking-wide">
          {formatClockTime(currentTime)}{" "}
          <span className="text-gray-500">
            / {formatClockTime(Number.isFinite(duration) ? duration : 0)}
          </span>
        </div>

        {/* right cluster */}
        <div className="flex items-center gap-4">
          <div className="text-[12px]">
            {qualityLabel}
            <span className="text-[10px] align-top ml-[2px] text-gray-400">
              HD
            </span>
          </div>
          <IconButton onClick={onFullscreen} title="Fullscreen">
            <FullscreenIcon />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
