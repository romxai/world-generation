/**
 * Slider.tsx
 *
 * A reusable slider component with label and values display.
 */

import React from "react";

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
}) => {
  return (
    <div className={`flex flex-col gap-1 mb-3 ${className}`}>
      <label className="text-sm font-medium">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-gray-300">
        <span>{leftLabel || min}</span>
        <span>{rightLabel || max}</span>
      </div>
    </div>
  );
};

export default Slider;
