import { useEffect, useRef, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import PlayerControlsBar from "./PlayerControllerBar";
import AnnotationToolbar from "./AnnotationToolbar";
import playIcon from "../../assets/svgs/play.svg";
import pauseIcon from "../../assets/svgs/pause.svg";
import {
  ANNOTATION_TOOLS,
  DEFAULT_ANNOTATION_COLOR,
  DEFAULT_ANNOTATION_STROKE_WIDTH,
  DEFAULT_ANNOTATION_TOOL,
  createAnnotation,
  hasAnnotationContent,
  normalizeAnnotation,
} from "../../helpers/annotation";

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
  onAnnotationDraftChange,
  onFinishAnnotation,
  markers = [],
  videoFps
  // projectId
}) {
  const annotationCanvasRef = useRef(null);
  const activePointerIdRef = useRef(null);
  const annotationDraftTimeRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingAnnotation, setDrawingAnnotation] = useState(null);
  const [draftShape, setDraftShape] = useState(null);
  const [annotationTool, setAnnotationTool] = useState(DEFAULT_ANNOTATION_TOOL);
  const [annotationColor, setAnnotationColor] = useState(DEFAULT_ANNOTATION_COLOR);
  const [annotationStrokeWidth, setAnnotationStrokeWidth] = useState(
    DEFAULT_ANNOTATION_STROKE_WIDTH
  );
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
  }, [playerRef, volume, isMuted]);


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
  }, [playerRef]);



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

    if (hasAnnotationContent(drawingAnnotation)) {
      onAnnotationDraftChange?.({
        time: annotationDraftTimeRef.current ?? currentTime,
        annotation: drawingAnnotation,
      });
      return;
    }

    onAnnotationDraftChange?.(null);
  }, [drawingAnnotation, annotationMode, currentTime, onAnnotationDraftChange]);

  const buildAnnotation = (elements) => {
    if (!elements.length) return null;
    return createAnnotation(elements);
  };

  const updateDrawingElements = (updater) => {
    setDrawingAnnotation((prev) => {
      const nextElements = updater([...normalizeAnnotation(prev).elements]);
      return buildAnnotation(nextElements);
    });
  };

  const getPointerPoint = (canvas, event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return {
      xPct: rect.width ? x / rect.width : 0,
      yPct: rect.height ? y / rect.height : 0,
    };
  };

  const createPenElement = (point) => ({
    id: `annotation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: ANNOTATION_TOOLS.PEN,
    color: annotationColor,
    strokeWidth: annotationStrokeWidth,
    points: [point],
  });

  const createShapeElement = (point) => ({
    id: `annotation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: annotationTool,
    color: annotationColor,
    strokeWidth: annotationStrokeWidth,
    start: point,
    end: point,
  });

  const hasVisibleBounds = (shape) => {
    if (!shape?.start || !shape?.end) return false;
    const dx = Math.abs(shape.end.xPct - shape.start.xPct);
    const dy = Math.abs(shape.end.yPct - shape.start.yPct);
    return dx > 0.003 || dy > 0.003;
  };

  const handleCanvasPointerDown = (e) => {
    if (!annotationMode) return;
    const canvas = annotationCanvasRef.current;
    if (!canvas) return;

    activePointerIdRef.current = e.pointerId;
    if (annotationDraftTimeRef.current == null) {
      annotationDraftTimeRef.current = currentTime;
    }
    canvas.setPointerCapture?.(e.pointerId);
    setIsDrawing(true);
    const point = getPointerPoint(canvas, e);

    if (annotationTool === ANNOTATION_TOOLS.PEN) {
      updateDrawingElements((elements) => [...elements, createPenElement(point)]);
      return;
    }

    setDraftShape(createShapeElement(point));
  };

  const handleCanvasPointerMove = (e) => {
    if (
      !annotationMode ||
      !isDrawing ||
      !annotationCanvasRef.current ||
      activePointerIdRef.current !== e.pointerId
    ) {
      return;
    }

    const point = getPointerPoint(annotationCanvasRef.current, e);

    if (annotationTool === ANNOTATION_TOOLS.PEN) {
      updateDrawingElements((elements) => {
        if (!elements.length) return elements;

        const nextElements = [...elements];
        const lastElement = nextElements[nextElements.length - 1];

        if (lastElement?.type !== ANNOTATION_TOOLS.PEN) {
          return nextElements;
        }

        nextElements[nextElements.length - 1] = {
          ...lastElement,
          points: [...(lastElement.points || []), point],
        };

        return nextElements;
      });
      return;
    }

    setDraftShape((prev) => (prev ? { ...prev, end: point } : prev));
  };

  const handleCanvasPointerUp = (e) => {
    if (!annotationMode) return;

    if (
      activePointerIdRef.current !== null &&
      e?.pointerId !== undefined &&
      activePointerIdRef.current !== e.pointerId
    ) {
      return;
    }

    try {
      annotationCanvasRef.current?.releasePointerCapture?.(activePointerIdRef.current);
    } catch {
      // Pointer capture can already be released on some browsers.
    }
    activePointerIdRef.current = null;
    setIsDrawing(false);

    if (annotationTool === ANNOTATION_TOOLS.PEN || !draftShape) {
      return;
    }

    if (!hasVisibleBounds(draftShape)) {
      setDraftShape(null);
      return;
    }

    updateDrawingElements((elements) => [...elements, draftShape]);
    setDraftShape(null);
  };

  useEffect(() => {
    if (!annotationMode) {
      setIsDrawing(false);
      setDraftShape(null);
      setDrawingAnnotation(null);
      annotationDraftTimeRef.current = null;
    }
  }, [annotationMode]);

  const handleUndoAnnotation = () => {
    if (draftShape) {
      setDraftShape(null);
      return;
    }

    updateDrawingElements((elements) => elements.slice(0, -1));
  };

  const handleClearAnnotation = () => {
    setDraftShape(null);
    setDrawingAnnotation(null);
  };

  const handleFinishDrawing = () => {
    onFinishAnnotation?.();
  };

  useEffect(() => {
    const canvas = annotationCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const toCanvasPoint = (point) => ({
      x: point.xPct * width,
      y: point.yPct * height,
    });

    const drawPenElement = (element) => {
      const points = element.points || [];
      if (!points.length) return;

      ctx.beginPath();

      if (points.length === 1) {
        const { x, y } = toCanvasPoint(points[0]);
        ctx.arc(x, y, Math.max((element.strokeWidth || 3) / 2, 1.5), 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      points.forEach((point, index) => {
        const { x, y } = toCanvasPoint(point);
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.stroke();
    };

    const drawArrowElement = (element) => {
      if (!element.start || !element.end) return;

      const start = toCanvasPoint(element.start);
      const end = toCanvasPoint(element.end);
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const headLength = Math.max(12, (element.strokeWidth || 3) * 3);

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(
        end.x - headLength * Math.cos(angle - Math.PI / 7),
        end.y - headLength * Math.sin(angle - Math.PI / 7)
      );
      ctx.lineTo(
        end.x - headLength * Math.cos(angle + Math.PI / 7),
        end.y - headLength * Math.sin(angle + Math.PI / 7)
      );
      ctx.closePath();
      ctx.fill();
    };

    const drawRectangleElement = (element) => {
      if (!element.start || !element.end) return;

      const start = toCanvasPoint(element.start);
      const end = toCanvasPoint(element.end);
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const rectWidth = Math.abs(end.x - start.x);
      const rectHeight = Math.abs(end.y - start.y);

      if (!rectWidth && !rectHeight) return;
      ctx.strokeRect(x, y, rectWidth, rectHeight);
    };

    const drawEllipseElement = (element) => {
      if (!element.start || !element.end) return;

      const start = toCanvasPoint(element.start);
      const end = toCanvasPoint(element.end);
      const centerX = (start.x + end.x) / 2;
      const centerY = (start.y + end.y) / 2;
      const radiusX = Math.abs(end.x - start.x) / 2;
      const radiusY = Math.abs(end.y - start.y) / 2;

      if (!radiusX && !radiusY) return;

      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.stroke();
    };

    const drawElement = (element, opacity = 1) => {
      if (!element) return;

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = element.strokeWidth || DEFAULT_ANNOTATION_STROKE_WIDTH;
      ctx.strokeStyle = element.color || DEFAULT_ANNOTATION_COLOR;
      ctx.fillStyle = element.color || DEFAULT_ANNOTATION_COLOR;

      switch (element.type) {
        case ANNOTATION_TOOLS.ARROW:
          drawArrowElement(element);
          break;
        case ANNOTATION_TOOLS.RECTANGLE:
          drawRectangleElement(element);
          break;
        case ANNOTATION_TOOLS.ELLIPSE:
          drawEllipseElement(element);
          break;
        case ANNOTATION_TOOLS.PEN:
        default:
          drawPenElement(element);
          break;
      }

      ctx.restore();
    };

    const drawAnnotation = (annotation, opacity = 1) => {
      normalizeAnnotation(annotation).elements.forEach((element) =>
        drawElement(element, opacity)
      );
    };

    const fps = videoFps || 60;
    const currentFrame = Math.round(currentTime * fps);
    const shouldDrawAtCurrentFrame = ({ time, frame }) => {
      const numericFrame = Number(frame);
      if (Number.isFinite(numericFrame)) {
        return numericFrame === currentFrame;
      }

      const numericTime = Number(time);
      if (!Number.isFinite(numericTime)) {
        return false;
      }

      return Math.round(numericTime * fps) === currentFrame;
    };

    (markers || []).forEach((marker) => {
      if (!marker.annotation) return;
      if (!shouldDrawAtCurrentFrame(marker)) return;
      drawAnnotation(marker.annotation, 0.95);
    });

    if (
      pendingAnnotation?.annotation &&
      shouldDrawAtCurrentFrame(pendingAnnotation)
    ) {
      drawAnnotation(pendingAnnotation.annotation, annotationMode ? 0.25 : 0.92);
    }

    if (annotationMode && drawingAnnotation) {
      drawAnnotation(drawingAnnotation, 1);
    }

    if (annotationMode && draftShape) {
      drawElement(draftShape, 0.95);
    }
  }, [
    markers,
    currentTime,
    annotationMode,
    drawingAnnotation,
    draftShape,
    pendingAnnotation,
    videoFps,
  ]);

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
      <div className="p-3 pb-0 lg:p-4 lg:pb-0">
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
                <AnnotationToolbar
                  tool={annotationTool}
                  onToolChange={setAnnotationTool}
                  color={annotationColor}
                  onColorChange={setAnnotationColor}
                  strokeWidth={annotationStrokeWidth}
                  onStrokeWidthChange={setAnnotationStrokeWidth}
                  canUndo={
                    !!draftShape || normalizeAnnotation(drawingAnnotation).elements.length > 0
                  }
                  canClear={!!draftShape || hasAnnotationContent(drawingAnnotation)}
                  onUndo={handleUndoAnnotation}
                  onClear={handleClearAnnotation}
                  onDone={handleFinishDrawing}
                />
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
              onPointerCancel={handleCanvasPointerUp}
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
      <div className="h-1 lg:h-2" />
    </div>
  );
}