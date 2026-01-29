import React from "react";

export default function Spinner({
  size = 20,
  thickness = 2,
  color = "#FEEA3B",
  className = ""
}) {
  return (
    <svg
      className={`animate-spin ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth={thickness}
        fill="none"
        opacity="0.25"
      />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke={color}
        strokeWidth={thickness}
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
