/**
 * Slider.tsx
 *
 * A reusable slider component with label and values display.
 */

import React, { useState } from "react";

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  leftLabel?: string;
  rightLabel?: string;
  className?: string;
  tooltip?: string;
}

const Slider: React.FC<SliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  leftLabel,
  rightLabel,
  className = "",
  tooltip,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`flex flex-col gap-1 mb-3 ${className}`}>
      <div className="flex items-center">
        <label className="text-sm font-medium">{label}</label>

        {tooltip && (
          <div className="relative inline-block ml-2">
            <button
              className="w-4 h-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center justify-center focus:outline-none transition-colors duration-200"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              aria-label="Information"
            >
              i
            </button>
            {showTooltip && (
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-50 border border-blue-500">
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 appearance-none rounded-lg outline-none 
          bg-gradient-to-r from-blue-900 to-blue-300
          focus:outline-none focus:ring-2 focus:ring-blue-500
          hover:cursor-pointer"
        style={{
          WebkitAppearance: "none",
          cursor: "pointer",
        }}
      />
      <div className="flex justify-between text-xs text-gray-300">
        <span>{leftLabel || min}</span>
        <span>{rightLabel || max}</span>
      </div>
    </div>
  );
};

export default Slider;
