/**
 * RadialGradientControls.tsx
 *
 * Component for controlling the radial gradient effect that creates
 * oceans around the borders of the map.
 */

import React from "react";
import Slider from "./Slider";

interface RadialGradientControlsProps {
  radialCenterX: number;
  setRadialCenterX: (value: number) => void;
  radialCenterY: number;
  setRadialCenterY: (value: number) => void;
  radialRadius: number;
  setRadialRadius: (value: number) => void;
  radialFalloffExponent: number;
  setRadialFalloffExponent: (value: number) => void;
  radialStrength: number;
  setRadialStrength: (value: number) => void;
}

const RadialGradientControls: React.FC<RadialGradientControlsProps> = ({
  radialCenterX,
  setRadialCenterX,
  radialCenterY,
  setRadialCenterY,
  radialRadius,
  setRadialRadius,
  radialFalloffExponent,
  setRadialFalloffExponent,
  radialStrength,
  setRadialStrength,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-gray-700 p-3 rounded-md">
        <h4 className="font-medium mb-2">Gradient Center</h4>

        <Slider
          label="Center X Position"
          value={radialCenterX}
          onChange={setRadialCenterX}
          min={0}
          max={1}
          step={0.05}
          leftLabel={`Left (${radialCenterX.toFixed(2)})`}
          rightLabel="Right"
        />

        <Slider
          label="Center Y Position"
          value={radialCenterY}
          onChange={setRadialCenterY}
          min={0}
          max={1}
          step={0.05}
          leftLabel={`Top (${radialCenterY.toFixed(2)})`}
          rightLabel="Bottom"
        />
      </div>

      <div className="bg-gray-700 p-3 rounded-md">
        <h4 className="font-medium mb-2">Gradient Intensity</h4>

        <Slider
          label="Inner Radius"
          value={radialRadius}
          onChange={setRadialRadius}
          min={0.1}
          max={0.9}
          step={0.05}
          leftLabel={`Small (${radialRadius.toFixed(2)})`}
          rightLabel="Large"
        />

        <Slider
          label="Falloff Exponent"
          value={radialFalloffExponent}
          onChange={setRadialFalloffExponent}
          min={1}
          max={5}
          step={0.2}
          leftLabel={`Gradual (${radialFalloffExponent.toFixed(1)})`}
          rightLabel="Sharp"
        />

        <Slider
          label="Effect Strength"
          value={radialStrength}
          onChange={setRadialStrength}
          min={0}
          max={1}
          step={0.05}
          leftLabel={`Weak (${radialStrength.toFixed(2)})`}
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
