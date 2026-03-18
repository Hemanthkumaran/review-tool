import { useState, useRef, useEffect } from "react";
import { Sketch } from "@uiw/react-color";
import "./BrandColorPicker.css";

export default function BrandColorPicker({
  disabled,
  brandColor,
  setBrandColor,
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const color = brandColor || "#F9EF38";

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!wrapperRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="brand-wrapper relative">
      <label className="brand-label">Branding Colour</label>

      <div className="brand-input">
        {/* 🎨 COLOR BOX (hover trigger) */}
        <div
          className="color-box"
          style={{ backgroundColor: color }}
          onMouseEnter={() => !disabled && setOpen(true)}
        />

        {/* ✍️ HEX INPUT */}
        <input
          type="text"
          value={color.replace("#", "").toUpperCase()}
          disabled={disabled}
          onChange={(e) => {
            let val = e.target.value.toUpperCase();

            // allow only hex chars
            if (!/^[0-9A-F]{0,6}$/.test(val)) return;

            setBrandColor("#" + val);
          }}
          className="color-input"
        />
      </div>

      {/* 🎯 PICKER (OPENS ABOVE) */}
      {open && (
        <div
          className="picker-popover"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <Sketch
            color={color}
            onChange={(c) => setBrandColor(c.hex)}
            disableAlpha
            style={{
              background: "#050507",
              padding: 10,
              borderRadius: 12,
            }}
          />
        </div>
      )}
    </div>
  );
}