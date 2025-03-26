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
import ResourceControls from "./ResourceControls";
import ContinentalControls from "./ContinentalControls";

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

  // Continental falloff properties
  continentalEnabled: boolean;
  setContinentalEnabled: (value: boolean) => void;
  continentalSharpness: number;
  setContinentalSharpness: (value: number) => void;
  continentalScale: number;
  setContinentalScale: (value: number) => void;
  continentalThreshold: number;
  setContinentalThreshold: (value: number) => void;
  continentalStrength: number;
  setContinentalStrength: (value: number) => void;
  continentalOceanDepth: number;
  setContinentalOceanDepth: (value: number) => void;

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

  resourceDensity: number;
  resourceScale: number;
  onResourceDensityChange: (value: number) => void;
  onResourceScaleChange: (value: number) => void;
}

const GenerationControls: React.FC<GenerationControlsProps> = (props) => {
  // State to track which section is active
  const [activeSection, setActiveSection] = useState<string>("general");

  // Toggle a section
  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? "" : section);
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg max-h-screen overflow-y-auto">
      <h2 className="text-xl font-bold mb-6">World Generation Controls</h2>

      {/* Visualization Mode Selection */}
      <div className="mb-6">
        <label className="font-semibold mb-2 block">Visualization Mode</label>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <button
            className={`px-2 py-1 rounded ${
              props.visualizationMode === VisualizationMode.BIOME
                ? "bg-blue-600"
                : "bg-gray-700"
            }`}
            onClick={() => props.setVisualizationMode(VisualizationMode.BIOME)}
          >
            Biome Map
          </button>
          <button
            className={`px-2 py-1 rounded ${
              props.visualizationMode === VisualizationMode.ELEVATION
                ? "bg-blue-600"
                : "bg-gray-700"
            }`}
            onClick={() =>
              props.setVisualizationMode(VisualizationMode.ELEVATION)
            }
          >
            Elevation Map
          </button>
          <button
            className={`px-2 py-1 rounded ${
              props.visualizationMode === VisualizationMode.MOISTURE
                ? "bg-blue-600"
                : "bg-gray-700"
            }`}
            onClick={() =>
              props.setVisualizationMode(VisualizationMode.MOISTURE)
            }
          >
            Moisture Map
          </button>
          <button
            className={`px-2 py-1 rounded ${
              props.visualizationMode === VisualizationMode.TEMPERATURE
                ? "bg-blue-600"
                : "bg-gray-700"
            }`}
            onClick={() =>
              props.setVisualizationMode(VisualizationMode.TEMPERATURE)
            }
          >
            Temperature Map
          </button>
          <button
            className={`px-2 py-1 rounded ${
              props.visualizationMode === VisualizationMode.RESOURCE
                ? "bg-blue-600"
                : "bg-gray-700"
            }`}
            onClick={() =>
              props.setVisualizationMode(VisualizationMode.RESOURCE)
            }
          >
            Resource Map
          </button>
        </div>
      </div>

      {/* Control Type Selection */}
      <div className="mb-6">
        <label className="font-semibold mb-2 block">Control Panel</label>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <button
            className={`px-2 py-1 rounded ${
              activeSection === "general" ? "bg-blue-600" : "bg-gray-700"
            }`}
            onClick={() => toggleSection("general")}
          >
            General
          </button>
          <button
            className={`px-2 py-1 rounded ${
              activeSection === "noise" ? "bg-blue-600" : "bg-gray-700"
            }`}
            onClick={() => toggleSection("noise")}
          >
            Noise
          </button>
          <button
            className={`px-2 py-1 rounded ${
              activeSection === "biomes" ? "bg-blue-600" : "bg-gray-700"
            }`}
            onClick={() => toggleSection("biomes")}
          >
            Biome
          </button>
          <button
            className={`px-2 py-1 rounded ${
              activeSection === "climate" ? "bg-blue-600" : "bg-gray-700"
            }`}
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
          >
            Climate
          </button>
          <button
            className={`px-2 py-1 rounded ${
              activeSection === "thresholds" ? "bg-blue-600" : "bg-gray-700"
            }`}
            onClick={() => toggleSection("thresholds")}
          >
            Thresholds
          </button>
          <button
            className={`px-2 py-1 rounded ${
              activeSection === "radial" ? "bg-blue-600" : "bg-gray-700"
            }`}
            onClick={() => toggleSection("radial")}
          >
            Global Oceans
          </button>
          <button
            className={`px-2 py-1 rounded ${
              activeSection === "continental" ? "bg-blue-600" : "bg-gray-700"
            }`}
            onClick={() => toggleSection("continental")}
          >
            Continents
          </button>
          <button
            className={`px-2 py-1 rounded ${
              activeSection === "resource" ? "bg-blue-600" : "bg-gray-700"
            }`}
            onClick={() => toggleSection("resource")}
          >
            Resources
          </button>
        </div>
      </div>

      {/* Active Control Panel */}
      <div className="mt-4">
        {activeSection === "general" && (
          <GeneralControls
            seed={props.seed}
            setSeed={props.setSeed}
            visualizationMode={props.visualizationMode}
            setVisualizationMode={props.setVisualizationMode}
            biomePreset={props.biomePreset}
            setBiomePreset={props.setBiomePreset}
            showWeightEditor={props.showWeightEditor}
            setShowWeightEditor={props.setShowWeightEditor}
            generateNewSeed={props.generateNewSeed}
          />
        )}

        {activeSection === "noise" && (
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
        )}

        {activeSection === "biomes" && (
          <BiomeControls
            biomeWeights={props.biomeWeights}
            setBiomeWeights={props.setBiomeWeights}
            customWeights={props.customWeights}
            setCustomWeights={props.setCustomWeights}
            applyCustomWeights={props.applyCustomWeights}
            showWeightEditor={props.showWeightEditor}
          />
        )}

        {activeSection === "climate" && (
          <ClimateControls
            equatorPosition={props.equatorPosition}
            setEquatorPosition={props.setEquatorPosition}
            temperatureVariance={props.temperatureVariance}
            setTemperatureVariance={props.setTemperatureVariance}
            elevationTempEffect={props.elevationTempEffect}
            setElevationTempEffect={props.setElevationTempEffect}
            temperatureBandScale={props.temperatureBandScale}
            setTemperatureBandScale={props.setTemperatureBandScale}
            noiseScale={props.temperatureNoiseScale || 0}
            setNoiseScale={props.setTemperatureNoiseScale || (() => {})}
            noiseOctaves={props.temperatureNoiseOctaves || 0}
            setNoiseOctaves={props.setTemperatureNoiseOctaves || (() => {})}
            noisePersistence={props.temperatureNoisePersistence || 0}
            setNoisePersistence={
              props.setTemperatureNoisePersistence || (() => {})
            }
            polarTemperature={props.polarTemperature || 0}
            setPolarTemperature={props.setPolarTemperature || (() => {})}
            equatorTemperature={props.equatorTemperature || 0}
            setEquatorTemperature={props.setEquatorTemperature || (() => {})}
          />
        )}

        {activeSection === "thresholds" && (
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
            moistureThresholds={props.moistureThresholds || MOISTURE_THRESHOLDS}
            setMoistureThresholds={props.setMoistureThresholds || (() => {})}
            temperatureThresholds={
              props.temperatureThresholds || TEMPERATURE_THRESHOLDS
            }
            setTemperatureThresholds={
              props.setTemperatureThresholds || (() => {})
            }
          />
        )}

        {activeSection === "radial" && (
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
        )}

        {activeSection === "continental" && (
          <ContinentalControls
            enabled={props.continentalEnabled}
            setEnabled={props.setContinentalEnabled}
            sharpness={props.continentalSharpness}
            setSharpness={props.setContinentalSharpness}
            scale={props.continentalScale}
            setScale={props.setContinentalScale}
            threshold={props.continentalThreshold}
            setThreshold={props.setContinentalThreshold}
            strength={props.continentalStrength}
            setStrength={props.setContinentalStrength}
            oceanDepth={props.continentalOceanDepth}
            setOceanDepth={props.setContinentalOceanDepth}
          />
        )}

        {activeSection === "resource" && (
          <ResourceControls
            resourceDensity={props.resourceDensity}
            resourceScale={props.resourceScale}
            onResourceDensityChange={props.onResourceDensityChange}
            onResourceScaleChange={props.onResourceScaleChange}
          />
        )}
      </div>
    </div>
  );
};

export default GenerationControls;
