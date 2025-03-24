/**
 * GenerationControls.tsx
 *
 * Component that contains all the world generation controls, properly organized
 * into logical groups for better user experience.
 */

import React, { useState } from "react";
import {
  MOISTURE_THRESHOLDS,
  TEMPERATURE_THRESHOLDS,
  VisualizationMode,
} from "../config";
import NoiseControls from "./NoiseControls";
import ClimateControls from "./ClimateControls";
import RadialGradientControls from "./RadialGradientControls";
import BiomeControls from "./BiomeControls";
import GeneralControls from "./GeneralControls";
import ThresholdControls from "./ThresholdControls";

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
  // New temperature properties (optional)
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

  // Add threshold properties
  moistureThresholds?: typeof MOISTURE_THRESHOLDS;
  setMoistureThresholds?: (thresholds: typeof MOISTURE_THRESHOLDS) => void;
  temperatureThresholds?: typeof TEMPERATURE_THRESHOLDS;
  setTemperatureThresholds?: (
    thresholds: typeof TEMPERATURE_THRESHOLDS
  ) => void;
}

const GenerationControls: React.FC<GenerationControlsProps> = (props) => {
  // State to track which section is active
  const [activeSection, setActiveSection] = useState<string>("general");

  // Toggle a section
  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? "" : section);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-4 w-full max-w-6xl">
      <h2 className="text-xl font-semibold mb-3">World Generation Controls</h2>

      {/* Control sections - collapsed by default */}
      <div className="space-y-2">
        {/* General Controls Section */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection("general")}
            className="w-full flex justify-between items-center p-3 bg-gray-700 hover:bg-gray-600 transition text-left"
          >
            <span className="font-medium">General Settings</span>
            <span>{activeSection === "general" ? "▼" : "►"}</span>
          </button>

          {activeSection === "general" && (
            <div className="p-3">
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
            </div>
          )}
        </div>

        {/* Noise Controls Section */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection("noise")}
            className="w-full flex justify-between items-center p-3 bg-gray-700 hover:bg-gray-600 transition text-left"
          >
            <span className="font-medium">Noise Generation Settings</span>
            <span>{activeSection === "noise" ? "▼" : "►"}</span>
          </button>

          {activeSection === "noise" && (
            <div className="p-3">
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
            </div>
          )}
        </div>

        {/* Climate Controls Section */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => {
              // Log temperature parameters when this section is opened
              if (activeSection !== "climate") {
                console.log("Temperature UI params:", {
                  noiseScale: props.temperatureNoiseScale,
                  noiseOctaves: props.temperatureNoiseOctaves,
                  noisePersistence: props.temperatureNoisePersistence,
                  polarTemperature: props.polarTemperature,
                  equatorTemperature: props.equatorTemperature,
                });
              }
              toggleSection("climate");
            }}
            className="w-full flex justify-between items-center p-3 bg-gray-700 hover:bg-gray-600 transition text-left"
          >
            <span className="font-medium">Temperature & Climate Settings</span>
            <span>{activeSection === "climate" ? "▼" : "►"}</span>
          </button>

          {activeSection === "climate" && (
            <div className="p-3">
              <ClimateControls
                equatorPosition={props.equatorPosition}
                setEquatorPosition={props.setEquatorPosition}
                temperatureVariance={props.temperatureVariance}
                setTemperatureVariance={props.setTemperatureVariance}
                elevationTempEffect={props.elevationTempEffect}
                setElevationTempEffect={props.setElevationTempEffect}
                temperatureBandScale={props.temperatureBandScale}
                setTemperatureBandScale={props.setTemperatureBandScale}
                noiseScale={props.temperatureNoiseScale}
                setNoiseScale={props.setTemperatureNoiseScale}
                noiseOctaves={props.temperatureNoiseOctaves}
                setNoiseOctaves={props.setTemperatureNoiseOctaves}
                noisePersistence={props.temperatureNoisePersistence}
                setNoisePersistence={props.setTemperatureNoisePersistence}
                polarTemperature={props.polarTemperature}
                setPolarTemperature={props.setPolarTemperature}
                equatorTemperature={props.equatorTemperature}
                setEquatorTemperature={props.setEquatorTemperature}
              />
            </div>
          )}
        </div>

        {/* Ocean Radial Effect Section */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection("radial")}
            className="w-full flex justify-between items-center p-3 bg-gray-700 hover:bg-gray-600 transition text-left"
          >
            <span className="font-medium">Ocean Radial Effect</span>
            <span>{activeSection === "radial" ? "▼" : "►"}</span>
          </button>

          {activeSection === "radial" && (
            <div className="p-3">
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
            </div>
          )}
        </div>

        {/* Biome Controls Section */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection("biomes")}
            className="w-full flex justify-between items-center p-3 bg-gray-700 hover:bg-gray-600 transition text-left"
          >
            <span className="font-medium">Biome Distribution</span>
            <span>{activeSection === "biomes" ? "▼" : "►"}</span>
          </button>

          {activeSection === "biomes" && (
            <div className="p-3">
              <BiomeControls
                biomeWeights={props.biomeWeights}
                setBiomeWeights={props.setBiomeWeights}
                customWeights={props.customWeights}
                setCustomWeights={props.setCustomWeights}
                applyCustomWeights={props.applyCustomWeights}
                showWeightEditor={props.showWeightEditor}
              />
            </div>
          )}
        </div>

        {/* Thresholds & Export Section */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection("thresholds")}
            className="w-full flex justify-between items-center p-3 bg-gray-700 hover:bg-gray-600 transition text-left"
          >
            <span className="font-medium">
              Thresholds & Export Configuration
            </span>
            <span>{activeSection === "thresholds" ? "▼" : "►"}</span>
          </button>

          {activeSection === "thresholds" && (
            <div className="p-3">
              <ThresholdControls
                seed={props.seed}
                tileSize={16} // Default tile size
                noiseDetail={props.noiseDetail}
                noiseFalloff={props.noiseFalloff}
                elevationOctaves={props.elevationOctaves}
                moistureOctaves={props.moistureOctaves}
                elevationScale={props.elevationScale}
                moistureScale={props.moistureScale}
                elevationPersistence={props.elevationPersistence}
                moisturePersistence={props.moisturePersistence}
                temperatureParams={{
                  equatorPosition: props.equatorPosition,
                  temperatureVariance: props.temperatureVariance,
                  elevationEffect: props.elevationTempEffect,
                  bandScale: props.temperatureBandScale,
                  noiseScale: props.temperatureNoiseScale,
                  noiseOctaves: props.temperatureNoiseOctaves,
                  noisePersistence: props.temperatureNoisePersistence,
                  polarTemperature: props.polarTemperature,
                  equatorTemperature: props.equatorTemperature,
                }}
                radialGradientParams={{
                  centerX: props.radialCenterX,
                  centerY: props.radialCenterY,
                  radius: props.radialRadius,
                  falloffExponent: props.radialFalloffExponent,
                  strength: props.radialStrength,
                }}
                biomeWeights={props.biomeWeights}
                moistureThresholds={
                  props.moistureThresholds || MOISTURE_THRESHOLDS
                }
                setMoistureThresholds={
                  props.setMoistureThresholds || (() => {})
                }
                temperatureThresholds={
                  props.temperatureThresholds || TEMPERATURE_THRESHOLDS
                }
                setTemperatureThresholds={
                  props.setTemperatureThresholds || (() => {})
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerationControls;
