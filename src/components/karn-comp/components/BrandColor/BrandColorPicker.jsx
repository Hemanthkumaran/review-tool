import { useState, useRef } from "react";
import { HexColorPicker } from "react-colorful";
import "./BrandColorPicker.css";

export default function BrandColorPicker({ disabled, brandColor, setBrandColor }) {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef(null);

  return (
    <div className="brand-wrapper">
      <label style={{ fontFamily:'Gilroy-Regular'}} className="brand-label">Branding Colour</label>
      <div
        className={`brand-input ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
        onClick={() => {
          if (!disabled) setOpen(!open);
        }}
      >
        <span className="color-box" style={{ backgroundColor: brandColor || "#F9EF38" }} />
        <span className="color-text">
          {brandColor?.replace("#", "").toUpperCase()|| "#F9EF38"}
        </span>
      </div>

      {open && (
        <div className="picker-popover" ref={pickerRef}>
          <HexColorPicker color={brandColor || "#F9EF38"} onChange={setBrandColor} />
        </div>
      )}
    </div>
  );
}
