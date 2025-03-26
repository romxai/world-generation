/**
 * ContinentalControls.tsx
 *
 * UI controls for continental falloff parameters to create distinct landmasses
 * separated by oceans, giving a more realistic continent appearance.
 */

import React from "react";
import Slider from "./Slider";
import { Switch } from "./Switch";
import { Tooltip } from "./Tooltip";

interface ContinentalControlsProps {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  sharpness: number;
  setSharpness: (value: number) => void;
  scale: number;
  setScale: (value: number) => void;
  threshold: number;
  setThreshold: (value: number) => void;
  strength: number;
  setStrength: (value: number) => void;
  oceanDepth: number;
  setOceanDepth: (value: number) => void;
}

const ContinentalControls: React.FC<ContinentalControlsProps> = ({
  enabled,
  setEnabled,
  sharpness,
  setSharpness,
  scale,
  setScale,
  threshold,
  setThreshold,
  strength,
  setStrength,
  oceanDepth,
  setOceanDepth,
}) => {
  return (
    <div className="p-4 bg-gray-900 rounded-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Continental Falloff</h3>
        <div className="flex items-center">
          <Switch checked={enabled} onChange={setEnabled} />
          <span className="ml-2 text-sm text-gray-300">
            {enabled ? "Enabled" : "Disabled"}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        Creates realistic continents by applying elevation falloff around
        distinct landmasses, separating them with deeper oceans.
      </p>

      <div className="space-y-6">
        <div>
          <div className="flex items-center mb-2">
            <h4 className="font-medium">Threshold</h4>
            <Tooltip content="Controls what areas are considered potential continents. Higher values create smaller, more isolated landmasses." />
          </div>
          <Slider
            value={threshold}
            min={0.2}
            max={0.7}
            step={0.01}
            onChange={setThreshold}
            label={threshold.toFixed(2)}
          />
        </div>

        <div>
          <div className="flex items-center mb-2">
            <h4 className="font-medium">Scale</h4>
            <Tooltip content="Controls the size of continental features. Higher values create larger continents with more variation." />
          </div>
          <Slider
            value={scale}
            min={50}
            max={300}
            step={5}
            onChange={setScale}
            label={`${scale.toFixed(0)}`}
          />
        </div>

        <div>
          <div className="flex items-center mb-2">
            <h4 className="font-medium">Sharpness</h4>
            <Tooltip content="Controls how sharp the transition is between continents and oceans. Higher values create steeper continental shelves." />
          </div>
          <Slider
            value={sharpness}
            min={1}
            max={10}
            step={0.1}
            onChange={setSharpness}
            label={sharpness.toFixed(1)}
          />
        </div>

        <div>
          <div className="flex items-center mb-2">
            <h4 className="font-medium">Strength</h4>
            <Tooltip content="Controls the overall strength of the continental falloff effect. Higher values create more pronounced separation between landmasses." />
          </div>
          <Slider
            value={strength}
            min={0.1}
            max={1}
            step={0.05}
            onChange={setStrength}
            label={`${(strength * 100).toFixed(0)}%`}
          />
        </div>

        <div>
          <div className="flex items-center mb-2">
            <h4 className="font-medium">Ocean Depth</h4>
            <Tooltip content="Controls how deep oceans are between continents. Higher values create deeper oceans with more dramatic separation between landmasses." />
          </div>
          <Slider
            value={oceanDepth}
            min={0.1}
            max={1}
            step={0.05}
            onChange={setOceanDepth}
            label={`${(oceanDepth * 100).toFixed(0)}%`}
          />
        </div>
      </div>
    </div>
  );
};

export default ContinentalControls;
