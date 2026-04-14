import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import {
  Check,
  Circle,
  MoveRight,
  Palette,
  PenTool,
  Square,
  Trash2,
  Undo2,
} from "lucide-react";
import {
  ANNOTATION_TOOLS,
  DEFAULT_ANNOTATION_COLOR,
  DEFAULT_ANNOTATION_STROKE_WIDTH,
} from "../../helpers/annotation";

const TOOL_CONFIG = [
  {
    id: ANNOTATION_TOOLS.PEN,
    label: "Pen",
    icon: <PenTool size={16} strokeWidth={2.1} />,
  },
  {
    id: ANNOTATION_TOOLS.ARROW,
    label: "Arrow",
    icon: <MoveRight size={16} strokeWidth={2.1} />,
  },
  {
    id: ANNOTATION_TOOLS.RECTANGLE,
    label: "Rectangle",
    icon: <Square size={16} strokeWidth={2.1} />,
  },
  {
    id: ANNOTATION_TOOLS.ELLIPSE,
    label: "Circle",
    icon: <Circle size={16} strokeWidth={2.1} />,
  },
];

const QUICK_COLORS = [
  DEFAULT_ANNOTATION_COLOR,
  "#FF7A59",
  "#7CFF6B",
  "#59E1FF",
  "#FF6BD6",
  "#FFFFFF",
];

const STROKE_OPTIONS = [2, DEFAULT_ANNOTATION_STROKE_WIDTH, 6];

function ToolbarButton({
  active = false,
  onClick,
  disabled = false,
  title,
  children,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-9 w-9 items-center justify-center rounded-xl border text-white transition ${
        active
          ? "border-[rgba(254,234,59,0.55)] bg-[rgba(254,234,59,0.16)]"
          : "border-white/10 bg-white/5 hover:bg-white/10"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export default function AnnotationToolbar({
  tool,
  onToolChange,
  color,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  canUndo,
  canClear,
  onUndo,
  onClear,
  onDone,
}) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <div className="absolute left-4 top-4 z-30 flex max-w-[calc(100%-32px)] flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-[rgba(10,10,11,0.88)] p-2 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] p-1">
        {TOOL_CONFIG.map(({ id, label, icon }) => (
          <ToolbarButton
            key={id}
            active={tool === id}
            onClick={() => onToolChange(id)}
            title={label}
          >
            {icon}
          </ToolbarButton>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] px-2 py-1.5">
        {QUICK_COLORS.map((swatch) => (
          <button
            key={swatch}
            type="button"
            title={swatch}
            onClick={() => onColorChange(swatch)}
            className={`h-6 w-6 rounded-full border-2 transition ${
              color.toLowerCase() === swatch.toLowerCase()
                ? "border-white"
                : "border-transparent hover:border-white/30"
            }`}
            style={{ backgroundColor: swatch }}
          />
        ))}

        <div className="relative">
          <ToolbarButton
            active={showColorPicker}
            onClick={() => setShowColorPicker((prev) => !prev)}
            title="More colors"
          >
            <Palette size={16} strokeWidth={2.1} />
          </ToolbarButton>

          {showColorPicker && (
            <div className="absolute left-0 top-[calc(100%+10px)] rounded-2xl border border-white/10 bg-[#0d0d0f] p-3 shadow-[0_20px_45px_rgba(0,0,0,0.45)]">
              <HexColorPicker color={color} onChange={onColorChange} />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] px-2 py-1.5">
        {STROKE_OPTIONS.map((size) => (
          <button
            key={size}
            type="button"
            title={`Stroke ${size}`}
            onClick={() => onStrokeWidthChange(size)}
            className={`flex h-8 min-w-8 items-center justify-center rounded-full border px-2 transition ${
              strokeWidth === size
                ? "border-[rgba(254,234,59,0.55)] bg-[rgba(254,234,59,0.16)]"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <span
              className="block rounded-full bg-white"
              style={{
                height: size + 1,
                width: size + 1,
              }}
            />
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ToolbarButton
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo"
          className={!canUndo ? "cursor-not-allowed opacity-40" : ""}
        >
          <Undo2 size={16} strokeWidth={2.1} />
        </ToolbarButton>

        <ToolbarButton
          onClick={onClear}
          disabled={!canClear}
          title="Clear"
          className={!canClear ? "cursor-not-allowed opacity-40" : ""}
        >
          <Trash2 size={16} strokeWidth={2.1} />
        </ToolbarButton>

        <button
          type="button"
          onClick={onDone}
          className="flex h-9 items-center gap-2 rounded-xl bg-[var(--brand-color,#FEEA3B)] px-3 text-sm font-medium text-black transition hover:brightness-105"
        >
          <Check size={16} strokeWidth={2.2} />
          Done
        </button>
      </div>
    </div>
  );
}
