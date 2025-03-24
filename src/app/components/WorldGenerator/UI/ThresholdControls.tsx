/**
 * ThresholdControls.tsx
 *
 * Component for adjusting threshold values and exporting configuration.
 */

import React, { useState } from "react";
import {
  MOISTURE_THRESHOLDS,
  TEMPERATURE_THRESHOLDS,
  TemperatureParams,
  RadialGradientParams,
  createConfigObject,
  exportConfigAsFile,
} from "../config";
import Slider from "./Slider";

interface ThresholdControlsProps {
  // Current configuration values for export
  seed: number;
  tileSize: number;
  noiseDetail: number;
  noiseFalloff: number;
  elevationOctaves: number;
  moistureOctaves: number;
  elevationScale: number;
  moistureScale: number;
  elevationPersistence: number;
  moisturePersistence: number;
  temperatureParams: TemperatureParams;
  radialGradientParams: RadialGradientParams;
  biomeWeights: number[];

  // Moisture threshold controls
  moistureThresholds: typeof MOISTURE_THRESHOLDS;
  setMoistureThresholds: (thresholds: typeof MOISTURE_THRESHOLDS) => void;

  // Temperature threshold controls
  temperatureThresholds: typeof TEMPERATURE_THRESHOLDS;
  setTemperatureThresholds: (thresholds: typeof TEMPERATURE_THRESHOLDS) => void;
}

const ThresholdControls: React.FC<ThresholdControlsProps> = (props) => {
  // Local state for thresholds
  const [moistureThresholds, setMoistureThresholds] = useState<
    typeof MOISTURE_THRESHOLDS
  >({ ...props.moistureThresholds });
  const [temperatureThresholds, setTemperatureThresholds] = useState<
    typeof TEMPERATURE_THRESHOLDS
  >({ ...props.temperatureThresholds });

  // Update local state and parent
  const updateMoistureThreshold = (
    key: keyof typeof MOISTURE_THRESHOLDS,
    value: number
  ) => {
    const updated = { ...moistureThresholds, [key]: value };
    setMoistureThresholds(updated);
    props.setMoistureThresholds(updated);
  };

  // Update local state and parent
  const updateTemperatureThreshold = (
    key: keyof typeof TEMPERATURE_THRESHOLDS,
    value: number
  ) => {
    const updated = { ...temperatureThresholds, [key]: value };
    setTemperatureThresholds(updated);
    props.setTemperatureThresholds(updated);
  };

  // Handle export button click
  const handleExport = () => {
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
      moistureThresholds,
      temperatureThresholds,
    });

    exportConfigAsFile(config);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Moisture thresholds */}
      <div className="bg-gray-700 p-3 rounded-md">
        <h4 className="font-medium mb-2">Moisture Thresholds</h4>

        <Slider
          label="Very Dry"
          value={moistureThresholds.VERY_DRY}
          onChange={(value) => updateMoistureThreshold("VERY_DRY", value)}
          min={0.05}
          max={0.3}
          step={0.01}
          leftLabel={`${moistureThresholds.VERY_DRY.toFixed(2)}`}
          rightLabel="Threshold"
        />

        <Slider
          label="Dry"
          value={moistureThresholds.DRY}
          onChange={(value) => updateMoistureThreshold("DRY", value)}
          min={0.2}
          max={0.5}
          step={0.01}
          leftLabel={`${moistureThresholds.DRY.toFixed(2)}`}
          rightLabel="Threshold"
        />

        <Slider
          label="Medium"
          value={moistureThresholds.MEDIUM}
          onChange={(value) => updateMoistureThreshold("MEDIUM", value)}
          min={0.4}
          max={0.7}
          step={0.01}
          leftLabel={`${moistureThresholds.MEDIUM.toFixed(2)}`}
          rightLabel="Threshold"
        />

        <Slider
          label="Wet"
          value={moistureThresholds.WET}
          onChange={(value) => updateMoistureThreshold("WET", value)}
          min={0.6}
          max={0.9}
          step={0.01}
          leftLabel={`${moistureThresholds.WET.toFixed(2)}`}
          rightLabel="Threshold"
        />
      </div>

      {/* Temperature thresholds */}
      <div className="bg-gray-700 p-3 rounded-md">
        <h4 className="font-medium mb-2">Temperature Thresholds</h4>

        <Slider
          label="Freezing"
          value={temperatureThresholds.FREEZING}
          onChange={(value) => updateTemperatureThreshold("FREEZING", value)}
          min={0.0}
          max={0.2}
          step={0.01}
          leftLabel={`${temperatureThresholds.FREEZING.toFixed(2)}`}
          rightLabel="Threshold"
        />

        <Slider
          label="Cold"
          value={temperatureThresholds.COLD}
          onChange={(value) => updateTemperatureThreshold("COLD", value)}
          min={0.1}
          max={0.4}
          step={0.01}
          leftLabel={`${temperatureThresholds.COLD.toFixed(2)}`}
          rightLabel="Threshold"
        />

        <Slider
          label="Cool"
          value={temperatureThresholds.COOL}
          onChange={(value) => updateTemperatureThreshold("COOL", value)}
          min={0.3}
          max={0.5}
          step={0.01}
          leftLabel={`${temperatureThresholds.COOL.toFixed(2)}`}
          rightLabel="Threshold"
        />

        <Slider
          label="Mild"
          value={temperatureThresholds.MILD}
          onChange={(value) => updateTemperatureThreshold("MILD", value)}
          min={0.45}
          max={0.65}
          step={0.01}
          leftLabel={`${temperatureThresholds.MILD.toFixed(2)}`}
          rightLabel="Threshold"
        />

        <Slider
          label="Warm"
          value={temperatureThresholds.WARM}
          onChange={(value) => updateTemperatureThreshold("WARM", value)}
          min={0.6}
          max={0.8}
          step={0.01}
          leftLabel={`${temperatureThresholds.WARM.toFixed(2)}`}
          rightLabel="Threshold"
        />

        <Slider
          label="Hot"
          value={temperatureThresholds.HOT}
          onChange={(value) => updateTemperatureThreshold("HOT", value)}
          min={0.75}
          max={0.95}
          step={0.01}
          leftLabel={`${temperatureThresholds.HOT.toFixed(2)}`}
          rightLabel="Threshold"
        />
      </div>

      {/* Export button */}
      <div className="col-span-1 md:col-span-2 mt-4 flex justify-center">
        <button
          onClick={handleExport}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            ></path>
          </svg>
          Export Configuration
        </button>
      </div>
    </div>
  );
};

export default ThresholdControls;
