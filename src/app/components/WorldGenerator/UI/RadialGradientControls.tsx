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
    <div className="grid grid-cols-1 gap-4">
      <div className="bg-gray-700 p-3 rounded-md">
        <h4 className="font-medium mb-2">Ocean Basin Shape</h4>
        <p className="text-xs text-gray-300 mb-3">
          These settings control how the world's oceans are shaped, affecting
          whether your world will have continents, islands, or a mix of both.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Slider
            label="Center X"
            value={radialCenterX}
            onChange={setRadialCenterX}
            min={0}
            max={1}
            step={0.05}
            leftLabel={`Left (${radialCenterX.toFixed(2)})`}
            rightLabel="Right"
            tooltip="Controls the horizontal position of the landmass center. 0.5 centers it in the middle of the map, lower values move it left, higher values move it right."
          />

          <Slider
            label="Center Y"
            value={radialCenterY}
            onChange={setRadialCenterY}
            min={0}
            max={1}
            step={0.05}
            leftLabel={`Top (${radialCenterY.toFixed(2)})`}
            rightLabel="Bottom"
            tooltip="Controls the vertical position of the landmass center. 0.5 centers it in the middle of the map, lower values move it up, higher values move it down."
          />
        </div>

        <Slider
          label="Inner Radius"
          value={radialRadius}
          onChange={setRadialRadius}
          min={0.1}
          max={0.9}
          step={0.05}
          leftLabel={`Small (${radialRadius.toFixed(2)})`}
          rightLabel="Large"
          tooltip="Controls the size of the inner landmass area. Lower values create smaller continents surrounded by more ocean, while higher values create larger landmasses with smaller oceans."
        />

        <Slider
          label="Falloff Exponent"
          value={radialFalloffExponent}
          onChange={setRadialFalloffExponent}
          min={0.5}
          max={5}
          step={0.1}
          leftLabel={`Gradual (${radialFalloffExponent.toFixed(1)})`}
          rightLabel="Sharp"
          tooltip="Controls how sharply land transitions to ocean at the edges. Lower values create gradual coastlines with many islands, while higher values create more defined, sharper coastlines."
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
          tooltip="Controls how strongly the radial gradient affects the overall terrain. Lower values allow more noise influence for varied terrain, while higher values enforce a more circular landmass pattern."
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
