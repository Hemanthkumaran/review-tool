import React from "react";
import { LayoutGroup, motion } from "framer-motion";


export default function SegmentedTabs({ options, value, onChange, className = "" }) {
  return (
    <LayoutGroup>
      <div
        className={
          "inline-flex w-full bg-black/40 rounded-full border border-[#202020] p-[3px] " +
          "text-[13px] " +
          className
        }
      >
        {options.map((opt) => {
          const isActive = opt.id === value;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={
                "relative flex-1 px-4 py-[6px] rounded-full text-center " +
                "transition-colors duration-150 select-none " +
                (isActive
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-100")
              }
            >
              {/* Sliding pill / highlight */}
              {isActive && (
                <motion.div
                  layoutId="segmented-pill"
                  className="absolute inset-[0px] rounded-full bg-[#1F1F21]"
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 28,
                  }}
                />
              )}

              {/* Label – keep it above the pill */}
              <span className="relative z-10">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
