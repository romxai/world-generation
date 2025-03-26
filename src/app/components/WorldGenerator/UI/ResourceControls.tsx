/**
 * ResourceControls.tsx
 *
 * Component for controlling resource generation parameters
 */

import React from "react";
import Slider from "./Slider";
import {
  ResourceType,
  ResourceConfig,
  DEFAULT_RESOURCE_CONFIGS,
} from "../config";

interface ResourceControlsProps {
  resourceConfigs: Record<ResourceType, ResourceConfig>;
  updateResourceConfig: (
    resourceType: ResourceType,
    field: keyof ResourceConfig,
    value: any
  ) => void;
}

const ResourceControls: React.FC<ResourceControlsProps> = ({
  resourceConfigs,
  updateResourceConfig,
}) => {
  // Get a sorted list of resource types for consistent UI display
  const resourceTypes = Object.values(ResourceType).sort() as ResourceType[];

  return (
    <div className="resource-controls space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {resourceTypes.map((resourceType) => {
          const config = resourceConfigs[resourceType];
          if (!config) return null;

          return (
            <div
              key={resourceType}
              className="p-3 border border-gray-700 rounded-lg"
            >
              <h4 className="text-lg font-medium mb-2 border-b border-gray-700 pb-1">
                {config.name}
              </h4>

              <div className="grid grid-cols-1 gap-2">
                {/* Base Density */}
                <Slider
                  label="Density"
                  value={config.baseDensity}
                  onChange={(value) =>
                    updateResourceConfig(resourceType, "baseDensity", value)
                  }
                  min={0.01}
                  max={0.3}
                  step={0.01}
                  leftLabel="Rare"
                  rightLabel="Common"
                />

                {/* Noise Scale */}
                <Slider
                  label="Distribution Scale"
                  value={config.noiseScale}
                  onChange={(value) =>
                    updateResourceConfig(resourceType, "noiseScale", value)
                  }
                  min={50}
                  max={500}
                  step={10}
                  leftLabel="Clustered"
                  rightLabel="Dispersed"
                />

                {/* Noise Octaves */}
                <Slider
                  label="Detail Level"
                  value={config.noiseOctaves}
                  onChange={(value) =>
                    updateResourceConfig(
                      resourceType,
                      "noiseOctaves",
                      Math.round(value)
                    )
                  }
                  min={1}
                  max={5}
                  step={1}
                  leftLabel="Simple"
                  rightLabel="Complex"
                />

                {/* Noise Persistence */}
                <Slider
                  label="Distribution Roughness"
                  value={config.noisePersistence}
                  onChange={(value) =>
                    updateResourceConfig(
                      resourceType,
                      "noisePersistence",
                      value
                    )
                  }
                  min={0.2}
                  max={0.8}
                  step={0.05}
                  leftLabel="Smooth"
                  rightLabel="Rough"
                />
              </div>

              {/* Resource ranges display */}
              <div className="mt-3 text-xs text-gray-400">
                <div>
                  Elevation: {(config.elevationRange[0] * 100).toFixed(0)}% -{" "}
                  {(config.elevationRange[1] * 100).toFixed(0)}%
                </div>
                <div>
                  Moisture: {(config.moistureRange[0] * 100).toFixed(0)}% -{" "}
                  {(config.moistureRange[1] * 100).toFixed(0)}%
                </div>
                <div>
                  Temperature: {(config.temperatureRange[0] * 100).toFixed(0)}%
                  - {(config.temperatureRange[1] * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-700 bg-opacity-50 rounded-lg p-3 mt-4">
        <h4 className="text-sm font-medium mb-1">Resource Generation Notes</h4>
        <ul className="text-xs text-gray-300 list-disc list-inside space-y-1">
          <li>
            Resources appear based on suitable biomes, elevation, moisture, and
            temperature ranges
          </li>
          <li>Increasing density makes resources more common</li>
          <li>
            Scale controls how spread out deposits are (higher = more spread
            out)
          </li>
          <li>
            Detail level affects the complexity of resource distribution
            patterns
          </li>
          <li>View the Resource map to see resource distributions</li>
        </ul>
      </div>
    </div>
  );
};

export default ResourceControls;
