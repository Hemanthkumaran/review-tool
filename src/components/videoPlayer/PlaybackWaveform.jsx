import { useEffect, useRef, useState } from "react";

export default function PlaybackWaveform({ audioUrl }) {
  const audioRef = useRef(null);
  const barRef = useRef(null);

  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      setProgress(audio.currentTime / audio.duration);
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", () => setIsPlaying(false));

    return () => audio.removeEventListener("timeupdate", onTime);
  }, []);

  const toggle = () => {
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

  const seek = (e) => {
    const rect = barRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * audioRef.current.duration;
  };

  return (
    <div className="flex items-center gap-4 w-full">
      <audio ref={audioRef} src={audioUrl} />

      <button onClick={toggle} className="w-10 h-10 rounded-full bg-black">
        {isPlaying ? "⏸" : "▶"}
      </button>

      <div
        ref={barRef}
        onPointerDown={seek}
        className="relative flex-1 h-[40px] cursor-pointer"
      >
        {/* grey bars */}
        <div className="absolute inset-0 flex gap-[4px]">
          {Array.from({ length: 80 }).map((_, i) => (
            <div key={i} className="w-[3px] bg-[#2A2A2A] rounded-full" />
          ))}
        </div>

        {/* yellow overlay */}
        <div
          className="absolute inset-0 flex gap-[4px] overflow-hidden"
          style={{ width: `${progress * 100}%` }}
        >
          {Array.from({ length: 80 }).map((_, i) => (
            <div key={i} className="w-[3px] bg-[#F9F046] rounded-full" />
          ))}
        </div>

        {/* thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full"
          style={{ left: `calc(${progress * 100}% - 10px)` }}
        />
      </div>
    </div>
  );
}
