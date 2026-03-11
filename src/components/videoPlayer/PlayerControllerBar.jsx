import { useEffect, useRef, useState } from "react";

import CustomSeekBar from "./CustomSeekbar";
import playIcon from "../../assets/svgs/play.svg";
import pauseIcon from "../../assets/svgs/pause.svg";
import speakerIcon from "../../assets/svgs/speaker.svg";
import fullscreenIcon from "../../assets/svgs/fullscreen.svg";
import { LoopIcon } from "../../assets/svgs/SvgComponents";
import { MutedOutlined } from "@ant-design/icons";
import { formatClockTime } from "../../helpers/common";


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
  muted ? <MutedOutlined color="#fff" /> : <img src={speakerIcon} />;

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
  volume,
  onVolumeChange,
  playbackId
}) {
  const [qualityMenuOpen, setQualityMenuOpen] = useState(false);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const qualityRef = useRef(null);
  const qualityButtonRef = useRef(null);
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

  useEffect(() => {
    const close = () => setVolumeOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (
        qualityMenuOpen &&
        !qualityRef.current?.contains(e.target) &&
        !qualityButtonRef.current?.contains(e.target)
      ) {
        setQualityMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [qualityMenuOpen]);



  return (
    <div style={{ marginTop:-20}} className="select-none px-6">
      {/* seek bar with markers */}
      <CustomSeekBar
        duration={duration}
        currentTime={currentTime}
        markers={markers}
        onSeek={onSeek}
        playbackId={playbackId}
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

          {/* <IconButton
            onClick={onToggleLoop}
            title="Loop"
            active={isLooping}
          >
            <LoopIcon color={isLooping ? "#FEEA3B" : "#fff"} />
          </IconButton> */}
<div className="relative">
  {/* Volume button */}
  <IconButton
    onClick={() => {
      onToggleMute();
      setVolumeOpen(true); // keep slider open
    }}
    title={isMuted || volume === 0 ? "Unmute" : "Mute"}
    active={isMuted || volume === 0}
  >
    <VolumeIcon muted={isMuted || volume === 0} volume={volume} />
  </IconButton>

  {/* Volume popover */}
  {volumeOpen && (
    <div
      className="
        absolute bottom-10 left-1/2 -translate-x-1/2
        h-28 w-8 rounded-full
        bg-[#050507]/95
        border border-white/10
        shadow-lg
        flex items-center justify-center
        z-40
      "
      onMouseDown={(e) => e.stopPropagation()}
    >
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={isMuted ? 0 : volume}
        onChange={(e) => {
          const v = Number(e.target.value);
          onVolumeChange(v);
        }}
        className="volume-slider"
        orient="vertical"
      />
    </div>
  )}
</div>


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
            ref={qualityButtonRef}
            type="button"
            onClick={() => setQualityMenuOpen((o) => !o)}
            className="px-3 py-[4px] cursor-pointer rounded-full bg-[#101114] text-[12px] text-gray-100 flex items-center gap-1 border border-white/5 hover:border-white/30"
          >
            <span>{qualityLabel}</span>
            <span className="text-[10px] text-gray-400">HD</span>
            <span className="ml-1 text-[9px] text-gray-400">▾</span>
          </button>

          {qualityMenuOpen && (
            <div ref={qualityRef} className="absolute right-0 bottom-9 w-28 rounded-xl bg-[#050507]/95 border border-white/10 shadow-lg py-1 z-40">
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
