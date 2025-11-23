// VideoPlayerWithSeekbar.jsx
import React, { useEffect, useRef, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";

export default function VideoPlayerWithSeekbar({
  src,
  playerRef,
  currentTime,
  duration,
  isPlaying,
  markers,
  annotationMode,
  pendingAnnotation,  // from parent
  onTimeUpdate,
  onLoadedMetadata,
  onTogglePlay,
  onSeek,
  onAddAnnotation,    // ({ time, annotation }) => void  → when user presses Save
  onCancelAnnotation, // () => void                      → when user presses Cancel
}) {
  const annotationCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingAnnotation, setDrawingAnnotation] = useState(null); // { strokes: [{ points: [{xPct,yPct}]}] }

  /* ---------- canvas helpers ---------- */

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

    // start a new stroke
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
    // finish current stroke, but stay in drawing mode (user can start another)
    setIsDrawing(false);
  };

  // clear local drawing when annotation mode is turned off
  useEffect(() => {
    if (!annotationMode) {
      setIsDrawing(false);
      setDrawingAnnotation(null);
    }
  }, [annotationMode]);

  /* ---------- draw annotations & in-progress scribble ---------- */

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

    // saved annotations from markers (yellow)
    markers.forEach((m) => {
      if (!m.annotation) return;
      if (Math.abs(m.time - currentTime) > NEAR_THRESHOLD) return;
      drawStrokes(m.annotation, "rgba(254,234,59,0.95)", 3);
    });

    // pending unsent annotation from parent (blue-ish)
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

    // in-progress strokes while drawing (lighter blue)
    if (annotationMode && drawingAnnotation) {
      drawStrokes(drawingAnnotation, "rgba(180,180,255,0.95)", 3);
    }
  }, [markers, currentTime, annotationMode, drawingAnnotation, pendingAnnotation]);

  /* ---------- overlay Save/Cancel handlers ---------- */

  const handleSaveAnnotation = () => {
    if (!drawingAnnotation || !drawingAnnotation.strokes?.length) return;
    onAddAnnotation?.({
      time: currentTime,
      annotation: drawingAnnotation,
    });
    // parent will set annotationMode = false; local state will clear via effect
  };

  const handleCancelOverlay = () => {
    onCancelAnnotation?.();
    setIsDrawing(false);
    setDrawingAnnotation(null);
  };

  /* ---------- Mux player ---------- */

  const muxPlayerStyle = {
    width: "100%",
    height: "100%",
    display: "block",
    backgroundColor: "black",
  };

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
            style={muxPlayerStyle}
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={onLoadedMetadata}
          />

          {/* One stacking context for overlay + canvas */}
            <div
  className={`absolute inset-0 ${
    annotationMode ? "" : "pointer-events-none"
  }`}
>
  {/* light overlay & controls */}
  {annotationMode && (
    <>
      {/* semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none z-10" />
      {/* controls – highest z, pointer events ON */}
      <div className="absolute top-3 right-3 flex gap-2 z-30">
        <button
          type="button"
          onClick={handleCancelOverlay}
          className="px-3 py-1 text-[11px] rounded-full bg-black/70 text-gray-200 hover:bg-black/90 border border-white/10"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSaveAnnotation}
          disabled={
            !drawingAnnotation || !drawingAnnotation.strokes?.length
          }
          className="px-3 py-1 text-[11px] rounded-full bg-[#FEEA3B] text-black font-medium disabled:opacity-40 disabled:cursor-default"
        >
          Save
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

      <div className="h-4" />
    </div>
  );
}
