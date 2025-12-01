// src/components/videoPlayer/PlayerControlsBar.jsx
import React, { useState } from "react";

import CustomSeekBar from "./CustomSeekBar";
import playIcon from "../../assets/svgs/play.svg";
import pauseIcon from "../../assets/svgs/pause.svg";
import speakerIcon from "../../assets/svgs/speaker.svg";
import fullscreenIcon from "../../assets/svgs/fullscreen.svg";
import { LoopIcon } from "../../assets/svgs/SvgComponents";

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
    className={`w-8 h-8 rounded-full cursor-pointer flex items-center justify-center hover:bg-white/10 ${
      active ? "text-[#FEEA3B]" : "text-gray-200"
    }`}
  >
    {children}
  </button>
);

const PlayIcon = ({ playing }) =>
  playing ? <img src={pauseIcon} /> : <img src={playIcon} />;

const VolumeIcon = ({ muted }) =>
  muted ? <img src={speakerIcon} /> : <img src={speakerIcon} />;

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
  onQualityChange,
}) {
  const [qualityMenuOpen, setQualityMenuOpen] = useState(false);

  const QUALITY_OPTIONS = [
    { value: "auto", label: "Auto" },
    { value: "480p", label: "480p" },
    { value: "720p", label: "720p" },
    { value: "1080p", label: "1080p" },
  ];

  const handleSelectQuality = (value) => {
    onQualityChange?.(value);
    setQualityMenuOpen(false);
  };

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
            <LoopIcon color={isLooping ? "#FEEA3B" : "#fff"} />
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
        <div className="flex items-center gap-4 relative">
          {/* Quality selector */}
          <button
            type="button"
            onClick={() => setQualityMenuOpen((o) => !o)}
            className="px-3 py-[4px] cursor-pointer rounded-full bg-[#101114] text-[12px] text-gray-100 flex items-center gap-1 border border-white/5 hover:border-white/30"
          >
            <span>{qualityLabel}</span>
            <span className="text-[10px] text-gray-400">HD</span>
            <span className="ml-1 text-[9px] text-gray-400">▾</span>
          </button>

          {qualityMenuOpen && (
            <div className="absolute right-0 bottom-9 w-28 rounded-xl bg-[#050507]/95 border border-white/10 shadow-lg py-1 z-40">
              {QUALITY_OPTIONS.map((q) => (
                <button
                  key={q.value}
                  type="button"
                  onClick={() => handleSelectQuality(q.value)}
                  className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-white/10 ${
                    (qualityLabel === "Auto" && q.value === "auto") ||
                    qualityLabel === q.label
                      ? "text-[#FEEA3B]"
                      : "text-gray-200"
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          <IconButton onClick={onFullscreen} title="Fullscreen">
            <img src={fullscreenIcon} />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
