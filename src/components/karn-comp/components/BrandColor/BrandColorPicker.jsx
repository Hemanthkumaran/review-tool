import { useState, useRef } from "react";
import { HexColorPicker } from "react-colorful";
import "./BrandColorPicker.css";

export default function BrandColorPicker() {
  const [color, setColor] = useState("#F9EF38");
  const [open, setOpen] = useState(false);
  const pickerRef = useRef(null);

  return (
    <div className="brand-wrapper">
      <label className="brand-label">Branding Colour</label>

      <div className="brand-input" onClick={() => setOpen(!open)}>
        <span className="color-box" style={{ backgroundColor: color }} />
        <span className="color-text">
          {color.replace("#", "").toUpperCase()}
        </span>
      </div>

      {open && (
        <div className="picker-popover" ref={pickerRef}>
          <HexColorPicker color={color} onChange={setColor} />
        </div>
      )}
    </div>
  );
}
