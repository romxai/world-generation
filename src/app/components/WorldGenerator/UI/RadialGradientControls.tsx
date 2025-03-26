/**
 * RadialGradientControls.tsx
 *
 * Component for controlling the radial gradient effect that creates
 * oceans around the borders of the map.
 */

import React from "react";
import Slider from "./Slider";

interface RadialGradientControlsProps {
  centerX: number;
  setCenterX: (value: number) => void;
  centerY: number;
  setCenterY: (value: number) => void;
  radius: number;
  setRadius: (value: number) => void;
  falloffExponent: number;
  setFalloffExponent: (value: number) => void;
  strength: number;
  setStrength: (value: number) => void;
}

const RadialGradientControls: React.FC<RadialGradientControlsProps> = ({
  centerX,
  setCenterX,
  centerY,
  setCenterY,
  radius,
  setRadius,
  falloffExponent,
  setFalloffExponent,
  strength,
  setStrength,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-gray-700 p-3 rounded-md">
        <h4 className="font-medium mb-2">Gradient Center</h4>

        <Slider
          label="Center X Position"
          value={centerX}
          onChange={setCenterX}
          min={0}
          max={1}
          step={0.05}
          leftLabel={`Left (${centerX.toFixed(2)})`}
          rightLabel="Right"
        />

        <Slider
          label="Center Y Position"
          value={centerY}
          onChange={setCenterY}
          min={0}
          max={1}
          step={0.05}
          leftLabel={`Top (${centerY.toFixed(2)})`}
          rightLabel="Bottom"
        />
      </div>

      <div className="bg-gray-700 p-3 rounded-md">
        <h4 className="font-medium mb-2">Gradient Intensity</h4>

        <Slider
          label="Inner Radius"
          value={radius}
          onChange={setRadius}
          min={0.1}
          max={0.9}
          step={0.05}
          leftLabel={`Small (${radius.toFixed(2)})`}
          rightLabel="Large"
        />

        <Slider
          label="Falloff Exponent"
          value={falloffExponent}
          onChange={setFalloffExponent}
          min={1}
          max={5}
          step={0.2}
          leftLabel={`Gradual (${falloffExponent.toFixed(1)})`}
          rightLabel="Sharp"
        />

        <Slider
          label="Effect Strength"
          value={strength}
          onChange={setStrength}
          min={0}
          max={1}
          step={0.05}
          leftLabel={`Weak (${strength.toFixed(2)})`}
          rightLabel="Strong"
        />
      </div>

      <div className="col-span-1 md:col-span-2 bg-gray-600 p-3 rounded-md">
        <p className="text-sm">
          The radial gradient effect creates oceans that surround the center
          land masses. Adjust the center position, inner radius, and falloff to
          control the shape and size of continents. Increasing strength makes
          the ocean effect more prominent.
        </p>
      </div>
    </div>
  );
};

export default RadialGradientControls;
