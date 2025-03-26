/**
 * ThresholdControls.tsx
 *
 * Component for adjusting moisture and temperature thresholds and exporting configuration.
 */

import React, { useState } from "react";
import {
  createConfigObject,
  exportConfigAsFile,
  MOISTURE_THRESHOLDS,
  TEMPERATURE_THRESHOLDS,
  ELEVATION_THRESHOLDS,
} from "../config";

interface ThresholdControlsProps {
  // Basic settings
  seed: number;
  tileSize: number;

  // Noise settings
  noiseDetail: number;
  noiseFalloff: number;
  elevationOctaves: number;
  moistureOctaves: number;
  elevationScale: number;
  moistureScale: number;
  elevationPersistence: number;
  moisturePersistence: number;

  // Temperature parameters
  temperatureParams: {
    equatorPosition: number;
    temperatureVariance: number;
    elevationEffect: number;
    bandScale: number;
    noiseScale?: number;
    noiseOctaves?: number;
    noisePersistence?: number;
    polarTemperature?: number;
    equatorTemperature?: number;
  };

  // Radial gradient parameters
  radialGradientParams: {
    centerX: number;
    centerY: number;
    radius: number;
    falloffExponent: number;
    strength: number;
  };

  // Biome weights
  biomeWeights: number[];

  // Threshold controls
  moistureThresholds: typeof MOISTURE_THRESHOLDS;
  setMoistureThresholds: (thresholds: typeof MOISTURE_THRESHOLDS) => void;
  temperatureThresholds: typeof TEMPERATURE_THRESHOLDS;
  setTemperatureThresholds: (thresholds: typeof TEMPERATURE_THRESHOLDS) => void;
  elevationThresholds?: typeof ELEVATION_THRESHOLDS;
  setElevationThresholds?: (thresholds: typeof ELEVATION_THRESHOLDS) => void;
}

// Info tooltip component for providing context on each control
const InfoTooltip: React.FC<{ text: string }> = ({ text }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block ml-2">
      <button
        className="w-5 h-5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center justify-center focus:outline-none transition-colors duration-200"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label="Information"
      >
        i
      </button>
      {showTooltip && (
        <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 w-72 p-3 bg-gray-800 text-white text-sm rounded shadow-lg z-50 border border-blue-500">
          {text}
        </div>
      )}
    </div>
  );
};

const ThresholdControls: React.FC<ThresholdControlsProps> = (props) => {
  // Local state for thresholds
  const [localMoistureThresholds, setLocalMoistureThresholds] = useState({
    ...props.moistureThresholds,
  });
  const [localTemperatureThresholds, setLocalTemperatureThresholds] = useState({
    ...props.temperatureThresholds,
  });
  const [localElevationThresholds, setLocalElevationThresholds] = useState(
    props.elevationThresholds
      ? { ...props.elevationThresholds }
      : { ...ELEVATION_THRESHOLDS }
  );

  // File input ref for importing config
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Handle changes to moisture thresholds
  const handleMoistureChange = (
    key: keyof typeof MOISTURE_THRESHOLDS,
    value: number
  ) => {
    const newThresholds = { ...localMoistureThresholds, [key]: value };
    setLocalMoistureThresholds(newThresholds);
    props.setMoistureThresholds(newThresholds);
  };

  // Handle changes to temperature thresholds
  const handleTemperatureChange = (
    key: keyof typeof TEMPERATURE_THRESHOLDS,
    value: number
  ) => {
    const newThresholds = { ...localTemperatureThresholds, [key]: value };
    setLocalTemperatureThresholds(newThresholds);
    props.setTemperatureThresholds(newThresholds);
  };

  // Handle changes to elevation thresholds
  const handleElevationChange = (
    key: keyof typeof ELEVATION_THRESHOLDS,
    value: number
  ) => {
    const newThresholds = { ...localElevationThresholds, [key]: value };
    setLocalElevationThresholds(newThresholds);
    if (props.setElevationThresholds) {
      props.setElevationThresholds(newThresholds);
    }
  };

  // Handle exporting the configuration
  const handleExportConfig = () => {
    const config = createConfigObject({
      seed: props.seed,
      tileSize: props.tileSize,
      noiseDetail: props.noiseDetail,
      noiseFalloff: props.noiseFalloff,
      elevationOctaves: props.elevationOctaves,
      moistureOctaves: props.moistureOctaves,
      elevationScale: props.elevationScale,
      moistureScale: props.moistureScale,
      elevationPersistence: props.elevationPersistence,
      moisturePersistence: props.moisturePersistence,
      temperatureParams: props.temperatureParams,
      radialGradientParams: props.radialGradientParams,
      biomeWeights: props.biomeWeights,
      moistureThresholds: localMoistureThresholds,
      temperatureThresholds: localTemperatureThresholds,
      elevationThresholds: localElevationThresholds,
    });

    exportConfigAsFile(config);
  };

  // Handle importing configuration
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedConfig = JSON.parse(e.target?.result as string);

        // Update local state and parent state for thresholds
        if (importedConfig.thresholds?.moisture) {
          setLocalMoistureThresholds(importedConfig.thresholds.moisture);
          props.setMoistureThresholds(importedConfig.thresholds.moisture);
        }

        if (importedConfig.thresholds?.temperature) {
          setLocalTemperatureThresholds(importedConfig.thresholds.temperature);
          props.setTemperatureThresholds(importedConfig.thresholds.temperature);
        }

        if (
          importedConfig.thresholds?.elevation &&
          props.setElevationThresholds
        ) {
          setLocalElevationThresholds(importedConfig.thresholds.elevation);
          props.setElevationThresholds(importedConfig.thresholds.elevation);
        }

        // Create a custom event that will be handled by the parent component
        const importEvent = new CustomEvent("config-imported", {
          detail: importedConfig,
          bubbles: true,
          composed: true, // This allows the event to pass through shadow DOM boundaries
        });

        // Dispatch the event from the window to ensure it bubbles up properly
        window.dispatchEvent(importEvent);

        // Add alert to confirm import
        alert(
          "Configuration imported successfully! Click 'Generate World' to apply all settings."
        );
      } catch (error) {
        console.error("Error importing configuration:", error);
        alert("Error importing configuration. Please check the file format.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Import/Export Controls */}
      <div className="flex space-x-4 mb-4">
        <button
          onClick={handleExportConfig}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white transition duration-200"
        >
          Export Configuration
        </button>
        <button
          onClick={handleImportClick}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition duration-200"
        >
          Import Configuration
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />
      </div>

      {/* Moisture Threshold Controls */}
      <div className="bg-gray-800 p-4 rounded-md">
        <h3 className="text-lg font-medium mb-3 border-b border-gray-700 pb-2">
          Moisture Thresholds
          <InfoTooltip text="Adjust moisture thresholds to control biome distribution. Lower values make regions more arid while higher values create more lush environments." />
        </h3>
        <div className="space-y-4">
          {Object.entries(localMoistureThresholds).map(([key, value]) => (
            <div key={key} className="grid grid-cols-3 items-center gap-4">
              <label className="text-sm font-medium col-span-1 capitalize flex items-center">
                {key.toLowerCase()}
                <InfoTooltip
                  text={`Controls the ${key.toLowerCase()} moisture threshold. This affects which biomes appear in areas with this moisture level.`}
                />
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={value}
                onChange={(e) =>
                  handleMoistureChange(
                    key as keyof typeof MOISTURE_THRESHOLDS,
                    parseFloat(e.target.value)
                  )
                }
                className="col-span-1"
              />
              <input
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={value}
                onChange={(e) =>
                  handleMoistureChange(
                    key as keyof typeof MOISTURE_THRESHOLDS,
                    parseFloat(e.target.value)
                  )
                }
                className="bg-gray-700 text-white p-1 rounded col-span-1 text-sm w-20"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Temperature Threshold Controls */}
      <div className="bg-gray-800 p-4 rounded-md">
        <h3 className="text-lg font-medium mb-3 border-b border-gray-700 pb-2">
          Temperature Thresholds
          <InfoTooltip text="Adjust temperature thresholds to control climate zones. Lower values create colder regions while higher values produce warmer environments." />
        </h3>
        <div className="space-y-4">
          {Object.entries(localTemperatureThresholds).map(([key, value]) => (
            <div key={key} className="grid grid-cols-3 items-center gap-4">
              <label className="text-sm font-medium col-span-1 capitalize flex items-center">
                {key.toLowerCase()}
                <InfoTooltip
                  text={`Controls the ${key.toLowerCase()} temperature threshold. This affects which biomes appear in areas with this temperature.`}
                />
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={value}
                onChange={(e) =>
                  handleTemperatureChange(
                    key as keyof typeof TEMPERATURE_THRESHOLDS,
                    parseFloat(e.target.value)
                  )
                }
                className="col-span-1"
              />
              <input
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={value}
                onChange={(e) =>
                  handleTemperatureChange(
                    key as keyof typeof TEMPERATURE_THRESHOLDS,
                    parseFloat(e.target.value)
                  )
                }
                className="bg-gray-700 text-white p-1 rounded col-span-1 text-sm w-20"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Elevation Threshold Controls */}
      <div className="bg-gray-800 p-4 rounded-md">
        <h3 className="text-lg font-medium mb-3 border-b border-gray-700 pb-2">
          Elevation Thresholds
          <InfoTooltip text="Adjust elevation thresholds to control terrain generation. Lower values create more water while higher values produce more mountains." />
        </h3>
        <div className="space-y-4">
          {Object.entries(localElevationThresholds).map(([key, value]) => (
            <div key={key} className="grid grid-cols-3 items-center gap-4">
              <label className="text-sm font-medium col-span-1 capitalize flex items-center">
                {key.toLowerCase().replace("_", " ")}
                <InfoTooltip text={getElevationTooltip(key)} />
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={value}
                onChange={(e) =>
                  handleElevationChange(
                    key as keyof typeof ELEVATION_THRESHOLDS,
                    parseFloat(e.target.value)
                  )
                }
                className="col-span-1"
              />
              <input
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={value}
                onChange={(e) =>
                  handleElevationChange(
                    key as keyof typeof ELEVATION_THRESHOLDS,
                    parseFloat(e.target.value)
                  )
                }
                className="bg-gray-700 text-white p-1 rounded col-span-1 text-sm w-20"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function to get elevation tooltip text
function getElevationTooltip(key: string): string {
  switch (key) {
    case "WATER_DEEP":
      return "Controls the depth of deep ocean regions. Values below this threshold will be deep ocean.";
    case "WATER_MEDIUM":
      return "Controls the depth of medium-depth ocean regions. Values between WATER_DEEP and WATER_MEDIUM will be medium-depth ocean.";
    case "WATER_SHALLOW":
      return "Controls the depth of shallow water regions. Values between WATER_MEDIUM and WATER_SHALLOW will be shallow water.";
    case "SHORE":
      return "Controls the width of shorelines and beaches. Values between WATER_SHALLOW and SHORE will be shore/beach areas.";
    case "LOW":
      return "Controls low elevation land (plains, grasslands). Values between SHORE and LOW will be low-elevation terrain.";
    case "MEDIUM":
      return "Controls medium elevation land (hills, forests). Values between LOW and MEDIUM will be medium-elevation terrain.";
    case "HIGH":
      return "Controls high elevation land (mountains). Values between MEDIUM and HIGH will be high-elevation terrain.";
    case "VERY_HIGH":
      return "Controls the highest elevation land (mountain peaks). Values between HIGH and VERY_HIGH will be very high terrain, and above VERY_HIGH will be extreme peaks.";
    default:
      return "Adjusts elevation threshold for terrain generation.";
  }
}

export default ThresholdControls;
