/**
 * ResourceControls.tsx
 *
 * UI controls for resource generation parameters
 */

import React from "react";
import Slider from "./Slider";

interface ResourceControlsProps {
  resourceDensity: number;
  resourceScale: number;
  onResourceDensityChange: (value: number) => void;
  onResourceScaleChange: (value: number) => void;
}

const ResourceControls: React.FC<ResourceControlsProps> = ({
  resourceDensity = 0.25, // Default value to prevent undefined errors
  resourceScale = 150, // Default value to prevent undefined errors
  onResourceDensityChange,
  onResourceScaleChange,
}) => {
  return (
    <div className="p-4 bg-gray-900 rounded-md">
      <h3 className="text-lg font-semibold mb-4">Resource Controls</h3>

      <div className="space-y-6">
        <div>
          <h4 className="font-medium mb-2">Resource Density</h4>
          <p className="text-xs text-gray-400 mb-2">
            Controls how common resources are in the world. Higher values mean
            more resources.
          </p>
          <Slider
            value={resourceDensity}
            min={0.05}
            max={0.5}
            step={0.01}
            onChange={onResourceDensityChange}
            label={`${(resourceDensity * 100).toFixed(0)}%`}
          />
        </div>

        <div>
          <h4 className="font-medium mb-2">Resource Scale</h4>
          <p className="text-xs text-gray-400 mb-2">
            Controls the size of resource patches. Higher values create larger
            deposits.
          </p>
          <Slider
            value={resourceScale}
            min={50}
            max={300}
            step={10}
            onChange={onResourceScaleChange}
            label={`${resourceScale?.toFixed(0) || "150"}`}
          />
        </div>
      </div>
    </div>
  );
};

export default ResourceControls;
