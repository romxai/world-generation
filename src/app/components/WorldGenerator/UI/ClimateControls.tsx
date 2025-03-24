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
  noiseScale: number;
  setNoiseScale: (value: number) => void;
  noiseOctaves: number;
  setNoiseOctaves: (value: number) => void;
  noisePersistence: number;
  setNoisePersistence: (value: number) => void;
  polarTemperature: number;
  setPolarTemperature: (value: number) => void;
  equatorTemperature: number;
  setEquatorTemperature: (value: number) => void;
}

const ClimateControls: React.FC<ClimateControlsProps> = ({
  equatorPosition,
  setEquatorPosition,
  temperatureVariance,
  setTemperatureVariance,
  elevationTempEffect,
  setElevationTempEffect,
  temperatureBandScale,
  setTemperatureBandScale,
  noiseScale = DEFAULT_TEMPERATURE_PARAMS.noiseScale || 8.0,
  setNoiseScale,
  noiseOctaves = DEFAULT_TEMPERATURE_PARAMS.noiseOctaves || 2,
  setNoiseOctaves,
  noisePersistence = DEFAULT_TEMPERATURE_PARAMS.noisePersistence || 0.4,
  setNoisePersistence,
  polarTemperature = DEFAULT_TEMPERATURE_PARAMS.polarTemperature || 0.1,
  setPolarTemperature,
  equatorTemperature = DEFAULT_TEMPERATURE_PARAMS.equatorTemperature || 0.9,
  setEquatorTemperature,
}) => {
  // Create safe setter functions that only call the original if defined
  const safeSetNoiseScale = (value: number) =>
    setNoiseScale && setNoiseScale(value);
  const safeSetNoiseOctaves = (value: number) =>
    setNoiseOctaves && setNoiseOctaves(value);
  const safeSetNoisePersistence = (value: number) =>
    setNoisePersistence && setNoisePersistence(value);
  const safeSetPolarTemperature = (value: number) =>
    setPolarTemperature && setPolarTemperature(value);
  const safeSetEquatorTemperature = (value: number) =>
    setEquatorTemperature && setEquatorTemperature(value);

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
        />

        <h4 className="font-medium mb-2 mt-4">Regional Variation Settings</h4>

        <Slider
          label="Variation Scale"
          value={noiseScale}
          onChange={safeSetNoiseScale}
          min={1}
          max={20}
          step={1}
          leftLabel={`Small (${noiseScale.toFixed(0)})`}
          rightLabel="Large"
        />

        <Slider
          label="Variation Detail"
          value={noiseOctaves}
          onChange={safeSetNoiseOctaves}
          min={1}
          max={5}
          step={1}
          leftLabel={`Smooth (${noiseOctaves.toFixed(0)})`}
          rightLabel="Detailed"
        />

        <Slider
          label="Variation Smoothness"
          value={noisePersistence}
          onChange={safeSetNoisePersistence}
          min={0.1}
          max={0.7}
          step={0.05}
          leftLabel={`Smoother (${noisePersistence.toFixed(2)})`}
          rightLabel="Rougher"
        />

        <div className="mt-4 p-3 bg-gray-600 rounded-md">
          <p className="text-sm">
            Higher scale values create larger regional patterns. Lower detail
            and smoother variations reduce noise in the final biome map.
          </p>

          <div className="mt-2">
            <p className="text-xs text-blue-300">
              All temperature settings will be applied when you click "Generate
              World". Current values: Scale: {noiseScale}, Detail:{" "}
              {noiseOctaves}, Smoothness: {noisePersistence.toFixed(2)}, Polar:{" "}
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
