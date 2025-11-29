import React, { useState } from "react";
import { Range } from "react-range";
import "./StorageSlider.css";

const STEP = 10;
const MIN = 500;
const MAX = 2000;

export default function StorageSlider() {
  const [values, setValues] = useState([900]); // Default mid-range

  return (
    <div className="slider-card">
      <p className="slider-title">
        Adjust your total storage. Changes will apply on your next billing date.
      </p>

      <Range
        step={STEP}
        min={MIN}
        max={MAX}
        values={values}
        onChange={(vals) => setValues(vals)}
        renderTrack={({ props, children }) => (
          <div {...props} className="slider-track" style={props.style}>
            <div
              className="slider-track-filled"
              style={{ width: `${((values[0] - MIN) / (MAX - MIN)) * 100}%` }}
            />
            <div className="slider-track-empty" />
            {children}
          </div>
        )}
        renderThumb={({ props }) => <div {...props} className="slider-thumb" />}
      />

      <div className="slider-labels">
        <span>{MIN} min</span>
        <span>{MAX} min</span>
      </div>
    </div>
  );
}
