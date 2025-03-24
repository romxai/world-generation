/**
 * ClimateControls.tsx
 *
 * Component for controlling climate and temperature parameters for the world.
 */

import React from "react";
import Slider from "./Slider";
import { DEFAULT_TEMPERATURE_PARAMS } from "../config";

interface ClimateControlsProps {
  equatorPosition: number;
  setEquatorPosition: (value: number) => void;
  temperatureVariance: number;
  setTemperatureVariance: (value: number) => void;
  elevationTempEffect: number;
  setElevationTempEffect: (value: number) => void;
  temperatureBandScale: number;
  setTemperatureBandScale: (value: number) => void;
  // These are all optional since they might not be used everywhere
  temperatureNoiseScale?: number;
  setTemperatureNoiseScale?: (value: number) => void;
  temperatureNoiseOctaves?: number;
  setTemperatureNoiseOctaves?: (value: number) => void;
  temperatureNoisePersistence?: number;
  setTemperatureNoisePersistence?: (value: number) => void;
  polarTemperature?: number;
  setPolarTemperature?: (value: number) => void;
  equatorTemperature?: number;
  setEquatorTemperature?: (value: number) => void;
}

// Add default values
const ClimateControls: React.FC<ClimateControlsProps> = ({
  equatorPosition,
  setEquatorPosition,
  temperatureVariance,
  setTemperatureVariance,
  elevationTempEffect,
  setElevationTempEffect,
  temperatureBandScale,
  setTemperatureBandScale,
  temperatureNoiseScale = DEFAULT_TEMPERATURE_PARAMS.noiseScale || 8.0,
  setTemperatureNoiseScale = () => {},
  temperatureNoiseOctaves = DEFAULT_TEMPERATURE_PARAMS.noiseOctaves || 2,
  setTemperatureNoiseOctaves = () => {},
  temperatureNoisePersistence = DEFAULT_TEMPERATURE_PARAMS.noisePersistence ||
    0.4,
  setTemperatureNoisePersistence = () => {},
  polarTemperature = DEFAULT_TEMPERATURE_PARAMS.polarTemperature || 0.1,
  setPolarTemperature = () => {},
  equatorTemperature = DEFAULT_TEMPERATURE_PARAMS.equatorTemperature || 0.9,
  setEquatorTemperature = () => {},
}) => {
  // Ensure we don't cross temperature boundaries
  const safeSetPolarTemperature = (value: number) => {
    // Keep polar temperature below equator temperature
    setPolarTemperature(Math.min(value, equatorTemperature - 0.1));
  };

  const safeSetEquatorTemperature = (value: number) => {
    // Keep equator temperature above polar temperature
    setEquatorTemperature(Math.max(value, polarTemperature + 0.1));
  };

  // Safe setters for noise parameters
  const safeSetNoiseScale = (value: number) => {
    setTemperatureNoiseScale(value);
  };

  const safeSetNoiseOctaves = (value: number) => {
    setTemperatureNoiseOctaves(Math.floor(value));
  };

  const safeSetNoisePersistence = (value: number) => {
    setTemperatureNoisePersistence(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-gray-700 p-3 rounded-md">
        <h4 className="font-medium mb-2">Temperature Distribution</h4>

        <Slider
          label="Equator Position"
          value={equatorPosition}
          onChange={setEquatorPosition}
          min={0.1}
          max={0.9}
          step={0.05}
          leftLabel={`South (${equatorPosition.toFixed(2)})`}
          rightLabel="North"
          tooltip="Controls where the equator (hottest region) is positioned on the map. 0.5 places it in the middle, lower values move it south, higher values move it north."
        />

        <Slider
          label="Temperature Variance"
          value={temperatureVariance}
          onChange={setTemperatureVariance}
          min={0}
          max={0.5}
          step={0.01}
          leftLabel={`Low (${temperatureVariance.toFixed(2)})`}
          rightLabel="High"
          tooltip="Controls the amount of random temperature variation throughout the world. Higher values create more varied microclimates."
        />

        <Slider
          label="Temperature Band Scale"
          value={temperatureBandScale}
          onChange={setTemperatureBandScale}
          min={0.5}
          max={2}
          step={0.1}
          leftLabel={`Wide (${temperatureBandScale.toFixed(1)})`}
          rightLabel="Narrow"
          tooltip="Controls how wide the temperature bands are from poles to equator. Higher values create narrower, more concentrated climate zones."
        />

        <Slider
          label="Polar Temperature"
          value={polarTemperature}
          onChange={safeSetPolarTemperature}
          min={0}
          max={0.5}
          step={0.05}
          leftLabel={`Cold (${polarTemperature.toFixed(2)})`}
          rightLabel="Warm"
          tooltip="Controls the base temperature at the poles. Higher values create warmer poles with less snow and ice."
        />

        <Slider
          label="Equator Temperature"
          value={equatorTemperature}
          onChange={safeSetEquatorTemperature}
          min={0.5}
          max={1}
          step={0.05}
          leftLabel={`Warm (${equatorTemperature.toFixed(2)})`}
          rightLabel="Hot"
          tooltip="Controls the base temperature at the equator. Higher values create hotter equatorial regions with more deserts and rainforests."
        />
      </div>

      <div className="bg-gray-700 p-3 rounded-md">
        <h4 className="font-medium mb-2">Elevation & Regional Effects</h4>

        <Slider
          label="Elevation Temperature Effect"
          value={elevationTempEffect}
          onChange={setElevationTempEffect}
          min={0}
          max={0.8}
          step={0.05}
          leftLabel={`Weak (${elevationTempEffect.toFixed(2)})`}
          rightLabel="Strong"
          tooltip="Controls how much elevation affects temperature. Higher values make mountains much colder than lowlands, creating more diverse vertical biomes."
        />

        <h4 className="font-medium mb-2 mt-4">Regional Variation Settings</h4>

        <Slider
          label="Variation Scale"
          value={temperatureNoiseScale}
          onChange={safeSetNoiseScale}
          min={1}
          max={20}
          step={1}
          leftLabel={`Small (${temperatureNoiseScale.toFixed(0)})`}
          rightLabel="Large"
          tooltip="Controls the size of regional temperature variations. Higher values create broader regions of temperature variation."
        />

        <Slider
          label="Variation Detail"
          value={temperatureNoiseOctaves}
          onChange={safeSetNoiseOctaves}
          min={1}
          max={5}
          step={1}
          leftLabel={`Smooth (${temperatureNoiseOctaves.toFixed(0)})`}
          rightLabel="Detailed"
          tooltip="Controls the complexity of temperature variations. Higher values add more detailed, local temperature differences."
        />

        <Slider
          label="Variation Smoothness"
          value={temperatureNoisePersistence}
          onChange={safeSetNoisePersistence}
          min={0.1}
          max={0.7}
          step={0.05}
          leftLabel={`Smoother (${temperatureNoisePersistence.toFixed(2)})`}
          rightLabel="Rougher"
          tooltip="Controls how smooth or rough the temperature transitions are. Higher values create more dramatic, chaotic temperature patterns."
        />

        <div className="mt-4 p-3 bg-gray-600 rounded-md">
          <p className="text-sm">
            Higher scale values create larger regional patterns. Lower detail
            and smoother variations reduce noise in the final biome map.
          </p>

          <div className="mt-2">
            <p className="text-xs text-blue-300">
              All temperature settings will be applied when you click "Generate
              World". Current values: Scale: {temperatureNoiseScale}, Detail:{" "}
              {temperatureNoiseOctaves}, Smoothness:{" "}
              {temperatureNoisePersistence.toFixed(2)}, Polar:{" "}
              {polarTemperature.toFixed(2)}, Equator:{" "}
              {equatorTemperature.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClimateControls;
