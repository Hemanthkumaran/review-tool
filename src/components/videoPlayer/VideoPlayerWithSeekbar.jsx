// VideoPlayerWithSeekbar.jsx
import React, { useEffect, useRef, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import PlayerControlsBar from "./PlayerControllerBar";
import MuxUploader from "./MuxUploader";
import { useLocation } from "react-router-dom";
import { getOneProjectApi } from "../../services/api";

export default function VideoPlayerWithSeekbar({
  src,
  playerRef,
  currentTime,
  duration,
  isPlaying,
  markers,
  annotationMode,
  pendingAnnotation, // from parent
  onTimeUpdate,
  onLoadedMetadata,
  onTogglePlay,
  onSeek,
  onAddAnnotation, // still accepted (legacy)
  onCancelAnnotation,
  onAnnotationDraftChange,
}) {
  const annotationCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingAnnotation, setDrawingAnnotation] = useState(null); // { strokes: [{ points: [{xPct,yPct}]}] }
  const [isLooping, setIsLooping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [projectDetail, setProjectDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const [muxUploadURL, setMuxUploadURL] = useState(null);
  const [isReadyToPlay, setIsReadyToPlay] = useState(false);
  const [playbackId, setPlaybackId] = useState(null);
  const [quality, setQuality] = useState("auto"); // "auto" | "480p" | "720p" | "1080p"

  useEffect(() => {
    getOneProjectApi(location.state.projectId)
      .then((res) => {
        console.log(res, "ririe");
        setProjectDetail(res.data.project);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  // notify parent when there is / isn't a drawing draft
  useEffect(() => {
    if (!annotationMode) {
      onAnnotationDraftChange?.(null);
      return;
    }

    const hasStrokes =
      drawingAnnotation && drawingAnnotation.strokes?.length > 0;

    if (hasStrokes) {
      onAnnotationDraftChange?.({
        time: currentTime,
        annotation: drawingAnnotation,
      });
    } else {
      onAnnotationDraftChange?.(null);
    }
  }, [drawingAnnotation, annotationMode, currentTime, onAnnotationDraftChange]);

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
      if (!annotation?.strokes) return;
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

    markers.forEach((m) => {
      if (!m.annotation) return;
      if (Math.abs(m.time - currentTime) > NEAR_THRESHOLD) return;
      drawStrokes(m.annotation, "rgba(254,234,59,0.95)", 3);
    });

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
    "--controls": "none",
  };

  const handleTogglePlay = () => {
    if (!playerRef.current) return;
    const el = playerRef.current;
    if (el.paused) {
      el.play?.();
    } else {
      el.pause?.();
    }
    onTogglePlay?.();
  };

  const handleLoopToggle = () => {
    if (!playerRef.current) return;
    const el = playerRef.current;
    const next = !isLooping;
    el.loop = next;
    setIsLooping(next);
  };

  const handleMuteToggle = () => {
    if (!playerRef.current) return;
    const el = playerRef.current;
    const next = !isMuted;
    el.muted = next;
    setIsMuted(next);
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

  if (loading) {
    return <div>loading...</div>;
  }

  return (
    <div className="bg-[#0b0c0e] rounded-2xl overflow-hidden shadow-lg">
      <div className="p-6 pb-0">
        <div className="w-full rounded-xl overflow-hidden border border-[#1b1b1b] relative bg-black">
          <MuxPlayer
            ref={playerRef}
            src={src}
            autoPlay={false}
            playsInline
            streamType="on-demand"
            playbackId={"97EiHRggujwIMW3QrDgWtlVlSUC00FdXVCghWV6SshSQ"}
            controls={false}
            style={muxPlayerStyle}
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={onLoadedMetadata}
            maxResolution={quality === "auto" ? undefined : quality}
          />

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

      <div className="px-6">
        <PlayerControlsBar
          duration={duration}
          currentTime={currentTime}
          markers={markers}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onSeek={onSeek}
          onToggleLoop={handleLoopToggle}
          isLooping={isLooping}
          onToggleMute={handleMuteToggle}
          isMuted={isMuted}
          qualityLabel={quality === "auto" ? "Auto" : quality}
          onQualityChange={setQuality}
          onFullscreen={handleFullscreen}
        />
      </div>
      <div className="h-4" />
    </div>
  );
}
