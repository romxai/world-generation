/**
 * GenerationControls.tsx
 *
 * Component that contains all the world generation controls, properly organized
 * into logical groups for better user experience.
 */

import React from "react";
import { VisualizationMode } from "../config";
import NoiseControls from "./NoiseControls";
import ClimateControls from "./ClimateControls";
import RadialGradientControls from "./RadialGradientControls";
import BiomeControls from "./BiomeControls";
import GeneralControls from "./GeneralControls";

interface GenerationControlsProps {
  // Basic properties
  seed: number;
  setSeed: (value: number) => void;
  visualizationMode: VisualizationMode;
  setVisualizationMode: (mode: VisualizationMode) => void;
  biomePreset: string;
  setBiomePreset: (preset: string) => void;

  // Noise properties
  noiseDetail: number;
  setNoiseDetail: (value: number) => void;
  noiseFalloff: number;
  setNoiseFalloff: (value: number) => void;
  elevationOctaves: number;
  setElevationOctaves: (value: number) => void;
  moistureOctaves: number;
  setMoistureOctaves: (value: number) => void;
  elevationScale: number;
  setElevationScale: (value: number) => void;
  moistureScale: number;
  setMoistureScale: (value: number) => void;
  elevationPersistence: number;
  setElevationPersistence: (value: number) => void;
  moisturePersistence: number;
  setMoisturePersistence: (value: number) => void;

  // Climate properties
  equatorPosition: number;
  setEquatorPosition: (value: number) => void;
  temperatureVariance: number;
  setTemperatureVariance: (value: number) => void;
  elevationTempEffect: number;
  setElevationTempEffect: (value: number) => void;
  temperatureBandScale: number;
  setTemperatureBandScale: (value: number) => void;

  // Radial gradient properties
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

  // Biome properties
  biomeWeights: number[];
  setBiomeWeights: (weights: number[]) => void;
  customWeights: number[];
  setCustomWeights: (weights: number[]) => void;

  // UI state
  showWeightEditor: boolean;
  setShowWeightEditor: (show: boolean) => void;

  // Actions
  generateNewSeed: () => void;
  applyCustomWeights: () => void;
}

const GenerationControls: React.FC<GenerationControlsProps> = (props) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-4 w-full max-w-6xl">
      <h2 className="text-xl font-semibold mb-3">World Generation Controls</h2>

      {/* Tab navigation for control groups */}
      <div className="mb-4 border-b border-gray-700">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
          <li className="mr-2">
            <button className="inline-block p-3 bg-gray-700 rounded-t-lg active">
              General
            </button>
          </li>
          <li className="mr-2">
            <button className="inline-block p-3 hover:bg-gray-600 rounded-t-lg">
              Noise
            </button>
          </li>
          <li className="mr-2">
            <button className="inline-block p-3 hover:bg-gray-600 rounded-t-lg">
              Climate
            </button>
          </li>
          <li className="mr-2">
            <button className="inline-block p-3 hover:bg-gray-600 rounded-t-lg">
              Radial Effect
            </button>
          </li>
          <li>
            <button className="inline-block p-3 hover:bg-gray-600 rounded-t-lg">
              Biomes
            </button>
          </li>
        </ul>
      </div>

      {/* General controls */}
      <GeneralControls
        seed={props.seed}
        setSeed={props.setSeed}
        visualizationMode={props.visualizationMode}
        setVisualizationMode={props.setVisualizationMode}
        biomePreset={props.biomePreset}
        setBiomePreset={props.setBiomePreset}
        generateNewSeed={props.generateNewSeed}
        showWeightEditor={props.showWeightEditor}
        setShowWeightEditor={props.setShowWeightEditor}
      />

      {/* Noise controls */}
      <NoiseControls
        noiseDetail={props.noiseDetail}
        setNoiseDetail={props.setNoiseDetail}
        noiseFalloff={props.noiseFalloff}
        setNoiseFalloff={props.setNoiseFalloff}
        elevationOctaves={props.elevationOctaves}
        setElevationOctaves={props.setElevationOctaves}
        moistureOctaves={props.moistureOctaves}
        setMoistureOctaves={props.setMoistureOctaves}
        elevationScale={props.elevationScale}
        setElevationScale={props.setElevationScale}
        moistureScale={props.moistureScale}
        setMoistureScale={props.setMoistureScale}
        elevationPersistence={props.elevationPersistence}
        setElevationPersistence={props.setElevationPersistence}
        moisturePersistence={props.moisturePersistence}
        setMoisturePersistence={props.setMoisturePersistence}
      />

      {/* Climate controls */}
      <ClimateControls
        equatorPosition={props.equatorPosition}
        setEquatorPosition={props.setEquatorPosition}
        temperatureVariance={props.temperatureVariance}
        setTemperatureVariance={props.setTemperatureVariance}
        elevationTempEffect={props.elevationTempEffect}
        setElevationTempEffect={props.setElevationTempEffect}
        temperatureBandScale={props.temperatureBandScale}
        setTemperatureBandScale={props.setTemperatureBandScale}
      />

      {/* Radial gradient controls */}
      <RadialGradientControls
        radialCenterX={props.radialCenterX}
        setRadialCenterX={props.setRadialCenterX}
        radialCenterY={props.radialCenterY}
        setRadialCenterY={props.setRadialCenterY}
        radialRadius={props.radialRadius}
        setRadialRadius={props.setRadialRadius}
        radialFalloffExponent={props.radialFalloffExponent}
        setRadialFalloffExponent={props.setRadialFalloffExponent}
        radialStrength={props.radialStrength}
        setRadialStrength={props.setRadialStrength}
      />

      {/* Biome controls */}
      <BiomeControls
        biomeWeights={props.biomeWeights}
        setBiomeWeights={props.setBiomeWeights}
        customWeights={props.customWeights}
        setCustomWeights={props.setCustomWeights}
        applyCustomWeights={props.applyCustomWeights}
        showWeightEditor={props.showWeightEditor}
      />
    </div>
  );
};

export default GenerationControls;
