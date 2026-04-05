import { useEffect, useRef, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import PlayerControlsBar from "./PlayerControllerBar";
import playIcon from "../../assets/svgs/play.svg";
import pauseIcon from "../../assets/svgs/pause.svg";

export default function VideoPlayerWithSeekbar({
  src,
  playerRef,
  currentTime,
  duration,
  isPlaying,
  annotationMode,
  pendingAnnotation,
  onTimeUpdate,
  onLoadedMetadata,
  onTogglePlay,
  onSeek,
  activeVersionId,
  onCancelAnnotation,
  onAnnotationDraftChange,
  markers = [],
  videoFps
  // projectId
}) {
  const annotationCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingAnnotation, setDrawingAnnotation] = useState(null); // { strokes: [{ points: [{xPct,yPct}]}] }
  const [isLooping, setIsLooping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [ready, setReady] = useState(false);
  const [quality, setQuality] = useState("auto"); // "auto" | "480p" | "720p" | "1080p"
  const lastVolumeRef = useRef(1);
  const [showOverlayIcon, setShowOverlayIcon] = useState(false);
  const [volume, setVolume] = useState(1);
  const [lastAction, setLastAction] = useState("play");
  
useEffect(() => {
  const player = playerRef.current;
  if (!player) return;

  const video =
    player.media ??
    player.shadowRoot?.querySelector("video");

  if (!video || !video.requestVideoFrameCallback) return;

  let frameId;

  const update = (now, metadata) => {
    const currentTime = metadata.mediaTime;

    // 👇 THIS is the key part
    onTimeUpdate?.({
      target: { currentTime }
    });

    frameId = video.requestVideoFrameCallback(update);
  };

  frameId = video.requestVideoFrameCallback(update);

  return () => {
    if (frameId && video.cancelVideoFrameCallback) {
      video.cancelVideoFrameCallback(frameId);
    }
  };
}, [playerRef, onTimeUpdate]);
  
  useEffect(() => {
    if (!playerRef.current) return;
    playerRef.current.volume = volume;
    playerRef.current.muted = isMuted;
  }, [volume, isMuted]);


  useEffect(() => {
    const onKey = (e) => {
  if (e.repeat) return;
  if (e.key !== " ") return;

  const el = document.activeElement;
  const isTyping =
    el?.tagName === "INPUT" ||
    el?.tagName === "TEXTAREA" ||
    el?.isContentEditable;

  if (isTyping) return;

  e.preventDefault();
  e.stopPropagation(); 

  const player = playerRef.current;
  if (!player) return;

  if (player.paused) {
    player.play();
    setLastAction("play");
  } else {
    player.pause();
    setLastAction("pause");
  }

  setShowOverlayIcon(true);
  setTimeout(() => setShowOverlayIcon(false), 500);
};

    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey);
  }, []);



  const handleVolumeChange = (v) => {
    setVolume(v);

    if (v === 0) {
      setIsMuted(true);
    } else {
      lastVolumeRef.current = v;
      setIsMuted(false);
    }
  };

  const handleToggleMute = () => {
    setIsMuted((prev) => {
      if (prev) {
        // unmute → restore volume
        const restore = lastVolumeRef.current || 0.5;
        setVolume(restore);
        return false;
      } else {
        // mute → remember volume
        lastVolumeRef.current = volume;
        setVolume(0);
        return true;
      }
    });
  };


  useEffect(() => {
    if (!annotationMode) return;

    const hasStrokes =
      drawingAnnotation && drawingAnnotation.strokes?.length > 0;

    if (hasStrokes) {
      onAnnotationDraftChange?.({
        time: currentTime,
        annotation: drawingAnnotation,
      });
    }
}, [drawingAnnotation, annotationMode, currentTime]);


  const addPointToStroke = (xPct, yPct) => {
    setDrawingAnnotation((prev) => {
      const strokes = prev?.strokes ? [...prev.strokes] : [];
      if (!strokes.length) {
        strokes.push({ points: [{ xPct, yPct }] });
      } else {
        const last = { ...strokes[strokes.length - 1] };
        const pts = last.points
          ? [...last.points, { xPct, yPct }]
          : [{ xPct, yPct }];
        last.points = pts;
        strokes[strokes.length - 1] = last;
      }
      return { strokes };
    });
  };

  const handleCanvasPointerDown = (e) => {
    if (!annotationMode) return;
    const canvas = annotationCanvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPct = x / rect.width;
    const yPct = y / rect.height;

    setDrawingAnnotation((prev) => {
      const strokes = prev?.strokes ? [...prev.strokes] : [];
      strokes.push({ points: [{ xPct, yPct }] });
      return { strokes };
    });
  };

  const handleCanvasPointerMove = (e) => {
    if (!annotationMode || !isDrawing || !annotationCanvasRef.current) return;
    const rect = annotationCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPct = x / rect.width;
    const yPct = y / rect.height;
    addPointToStroke(xPct, yPct);
  };

  const handleCanvasPointerUp = () => {
    if (!annotationMode) return;
    setIsDrawing(false);
  };

  useEffect(() => {
    if (!annotationMode) {
      setIsDrawing(false);
      setDrawingAnnotation(null);
    }
  }, [annotationMode]);

  useEffect(() => {
  const canvas = annotationCanvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const w = (canvas.width = canvas.clientWidth);
  const h = (canvas.height = canvas.clientHeight);

  ctx.clearRect(0, 0, w, h);

  const drawStrokes = (
    annotation,
    color = "rgba(254,234,59,0.95)",
    lineWidth = 3
  ) => {
    if (!annotation || !annotation.strokes || !annotation.strokes.forEach) {
      return;
    }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;

    annotation.strokes.forEach((stroke) => {
      const pts = stroke.points || [];
      if (pts.length < 2) return;

      ctx.beginPath();
      pts.forEach((p, idx) => {
        const x = p.xPct * w;
        const y = p.yPct * h;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
  };

  const NEAR_THRESHOLD = 0.5;

  // existing saved annotations (from markers)
  (markers || []).forEach((m) => {
    if (!m.annotation) return;
    if (Math.abs(m.time - currentTime) > NEAR_THRESHOLD) return;
    drawStrokes(m.annotation, "rgba(254,234,59,0.95)", 3);
  });

  // pending annotation (already saved draft in parent)
  if (
    pendingAnnotation &&
    pendingAnnotation.annotation &&
    Math.abs(pendingAnnotation.time - currentTime) <= NEAR_THRESHOLD
  ) {
    drawStrokes(
      pendingAnnotation.annotation,
      "rgba(129,140,248,0.95)",
      3
    );
  }

  // in-progress strokes while drawing (local draft)
  if (annotationMode && drawingAnnotation) {
    drawStrokes(drawingAnnotation, "rgba(180,180,255,0.95)", 3);
  }
}, [
  markers,
  currentTime,
  annotationMode,
  drawingAnnotation,
  pendingAnnotation,
]);


  const handleCancelOverlay = () => {
    onCancelAnnotation?.();
    onAnnotationDraftChange?.(null);
    setIsDrawing(false);
    setDrawingAnnotation(null);
  };

const muxPlayerStyle = {
  width: "100%",
  height: "100%",
  display: "block",
  backgroundColor: "black",
  objectFit: "contain",
  "--controls": "none",
  "--media-object-fit": "contain", // ✅ IMPORTANT
};


const handleTogglePlay = () => {
  if (!playerRef.current) return;

  const el = playerRef.current;

  if (el.paused) {
    el.play?.();
    setLastAction("play");
  } else {
    el.pause?.();
    setLastAction("pause");
  }

  // 👇 THIS IS THE IMPORTANT FIX
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  setShowOverlayIcon(true);
  setTimeout(() => setShowOverlayIcon(false), 500);
};

  const handleLoopToggle = () => {
    if (!playerRef.current) return;
    const el = playerRef.current;
    const next = !isLooping;
    el.loop = next;
    setIsLooping(next);
  };


  const handleFullscreen = () => {
    const el =
      playerRef.current?.media ??
      playerRef.current?.shadowRoot?.querySelector("video") ??
      playerRef.current;
    if (!el) return;

    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      el.requestFullscreen?.();
    }
  };


  return (
    <div className="rounded-2xl overflow-hidden shadow-lg">
      <div className="p-6 pb-0">
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[#1b1b1b] bg-black">
            {!ready && src && (
              <img
                src={`https://image.mux.com/${src}/thumbnail.jpg?time=0`}
                className="absolute inset-0 w-full h-full object-contain"
                alt=""
              />
            )}

            <div onClick={() => handleTogglePlay()} tabIndex={-1} className="w-full h-full flex items-center justify-center bg-black">
                        <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
              >
                <div
                  className={`transition-all duration-200 ${
                    showOverlayIcon ? "opacity-100 scale-100" : "opacity-0 scale-75"
                  }`}
                >
                  {lastAction === "play" ? (
                    <img src={playIcon} style={{ height: 50, width: 50 }} />
                  ) : (
                    <img src={pauseIcon} style={{ height: 50, width: 50 }} />
                  )}
                </div>
              </div>
            <MuxPlayer
              key={activeVersionId}
              ref={playerRef}
              autoPlay={false}
              playsInline
              streamType="on-demand"
              playbackId={src}
              controls={false}
              style={muxPlayerStyle}
              className="max-h-full max-w-full object-contain z-10"
              onTimeUpdate={onTimeUpdate}
              onLoadedMetadata={(e) => {
                setReady(true);
                onLoadedMetadata?.(e);
              }}
              onPlay={() => onTogglePlay?.(true)}
              onPause={() => onTogglePlay?.(false)}
              // onEnded={() => onTogglePlay?.(false)}
              maxResolution={quality === "auto" ? undefined : quality}
            />
          </div>
          <div
            className={`absolute inset-0 ${
              annotationMode ? "" : "pointer-events-none"
            }`}
          >
            {annotationMode && (
              <>
                <div className="absolute inset-0 bg-black/10 pointer-events-none z-10" />
                <div className="absolute top-3 right-3 flex gap-2 z-30">
                  <button
                    type="button"
                    onClick={handleCancelOverlay}
                    className="px-3 py-1 text-[11px] rounded-full bg-black/70 text-gray-200 hover:bg-black/90 border border-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            <canvas
              ref={annotationCanvasRef}
              className={`absolute inset-0 w-full h-full z-20 ${
                annotationMode
                  ? "pointer-events-auto cursor-crosshair"
                  : "pointer-events-none"
              }`}
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
            />
          </div>
        </div>
      </div>
      <PlayerControlsBar
        playerRef={playerRef}
        duration={duration}
        currentTime={currentTime}
        markers={markers}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onSeek={onSeek}
        onToggleLoop={handleLoopToggle}
        isLooping={isLooping}
        isMuted={isMuted}
        qualityLabel={quality === "auto" ? "Auto" : quality}
        onQualityChange={setQuality}
        onFullscreen={handleFullscreen}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        playbackId={src}
        videoFps={videoFps}
      />
      <div className="h-4" />
    </div>
  );
}
