// Button.jsx
import React from "react";

const Button = ({
  width,
  content,
  bgColor,
  border,
  textColor,
  marginRight,
  onClick,
  loading = false,
  disabled = false,
}) => {
  const isDisabled = loading || disabled;

  return (
    <button
      style={{
        backgroundColor: bgColor,
        width: width,
        padding: "8px 0",
        border: border ? border : "none",
        borderRadius: "22px",
        color: textColor,
        marginRight: marginRight || "0",
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.6 : 1,
        fontFamily: "Gilroy-Regular",
        transition: "opacity 0.2s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        position: "relative",
        fontSize: 14,
      }}
      onClick={!isDisabled ? onClick : undefined}
      disabled={isDisabled}
    >
      {/* LOADING SPINNER */}
      {loading ? (
        <div
          style={{
            width: 16,
            height: 16,
            border: "2px solid rgba(255,255,255,0.25)",
            borderTopColor: textColor || "#fff",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
          }}
        ></div>
      ) : (
        content
      )}

      {/* Spinner animation */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </button>
  );
};

export default Button;
