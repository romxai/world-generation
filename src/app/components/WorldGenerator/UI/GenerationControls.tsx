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
  ELEVATION_THRESHOLDS,
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

<<<<<<< HEAD
  resourceDensity: number;
  resourceScale: number;
  onResourceDensityChange: (value: number) => void;
  onResourceScaleChange: (value: number) => void;
=======
  // Add elevation threshold properties
  elevationThresholds?: typeof ELEVATION_THRESHOLDS;
  setElevationThresholds?: (thresholds: typeof ELEVATION_THRESHOLDS) => void;
>>>>>>> 80502046d576f72739e673a4aeafd82df96a0a43
}

const GenerationControls: React.FC<GenerationControlsProps> = (props) => {
  const [activeSection, setActiveSection] = useState<string>("general");

  const toggleSection = (section: string) => {
    if (activeSection === section) {
      setActiveSection("");
    } else {
      setActiveSection(section);
    }
  };

  return (
<<<<<<< HEAD
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg max-h-screen overflow-y-auto">
      <h2 className="text-xl font-bold mb-6">World Generation Controls</h2>

      {/* Visualization Mode Selection */}
      <div className="mb-6">
        <label className="font-semibold mb-2 block">Visualization Mode</label>
        <div className="grid grid-cols-2 gap-2 text-sm">
=======
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">
        World Generation Controls
      </h2>

      <div className="grid grid-cols-1 gap-4">
        {/* Sections with toggles for better organization */}
        <div className="border border-gray-700 rounded-lg overflow-hidden transition-all duration-300">
>>>>>>> 80502046d576f72739e673a4aeafd82df96a0a43
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
<<<<<<< HEAD
            General
          </button>
=======
            <span className="font-medium flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              General Settings
            </span>
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

        <div className="border border-gray-700 rounded-lg overflow-hidden">
>>>>>>> 80502046d576f72739e673a4aeafd82df96a0a43
          <button
            className={`px-2 py-1 rounded ${
              activeSection === "noise" ? "bg-blue-600" : "bg-gray-700"
            }`}
            onClick={() => toggleSection("noise")}
          >
<<<<<<< HEAD
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
=======
            <span className="font-medium flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Noise Controls
            </span>
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

        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection("climate")}
            className="w-full flex justify-between items-center p-3 bg-gray-700 hover:bg-gray-600 transition text-left"
          >
            <span className="font-medium flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                />
              </svg>
              Climate Controls
            </span>
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
                temperatureNoiseScale={props.temperatureNoiseScale}
                setTemperatureNoiseScale={props.setTemperatureNoiseScale}
                temperatureNoiseOctaves={props.temperatureNoiseOctaves}
                setTemperatureNoiseOctaves={props.setTemperatureNoiseOctaves}
                temperatureNoisePersistence={props.temperatureNoisePersistence}
                setTemperatureNoisePersistence={
                  props.setTemperatureNoisePersistence
                }
                polarTemperature={props.polarTemperature}
                setPolarTemperature={props.setPolarTemperature}
                equatorTemperature={props.equatorTemperature}
                setEquatorTemperature={props.setEquatorTemperature}
              />
            </div>
          )}
        </div>

        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection("radial")}
            className="w-full flex justify-between items-center p-3 bg-gray-700 hover:bg-gray-600 transition text-left"
          >
            <span className="font-medium flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
              Radial Gradient
            </span>
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

        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection("biomes")}
            className="w-full flex justify-between items-center p-3 bg-gray-700 hover:bg-gray-600 transition text-left"
          >
            <span className="font-medium flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
              Biome Weights
            </span>
            <span>{activeSection === "biomes" ? "▼" : "►"}</span>
          </button>

          {activeSection === "biomes" && (
            <div className="p-3">
              <BiomeControls
                biomeWeights={props.biomeWeights}
                setBiomeWeights={props.setBiomeWeights}
                customWeights={props.customWeights}
                setCustomWeights={props.setCustomWeights}
                biomePreset={props.biomePreset}
                setBiomePreset={props.setBiomePreset}
                showWeightEditor={props.showWeightEditor}
                setShowWeightEditor={props.setShowWeightEditor}
                applyCustomWeights={props.applyCustomWeights}
              />
            </div>
          )}
        </div>

        {/* Thresholds & Export Section */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
>>>>>>> 80502046d576f72739e673a4aeafd82df96a0a43
          <button
            className={`px-2 py-1 rounded ${
              activeSection === "thresholds" ? "bg-blue-600" : "bg-gray-700"
            }`}
            onClick={() => toggleSection("thresholds")}
          >
<<<<<<< HEAD
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
=======
            <span className="font-medium flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
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
                elevationThresholds={
                  props.elevationThresholds || ELEVATION_THRESHOLDS
                }
                setElevationThresholds={
                  props.setElevationThresholds || (() => {})
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* Generate button at the bottom */}
      <div className="sticky bottom-0 bg-gray-800 p-3 -mx-4 mt-4 text-center shadow-lg">
        <button
          className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white font-semibold transition-colors duration-200 flex items-center justify-center mx-auto"
          onClick={() => {
            // Trigger any parent update logic if needed
            if (props.generateNewSeed) {
              alert("Generating world with current settings...");
            }
          }}
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Generate World
        </button>
>>>>>>> 80502046d576f72739e673a4aeafd82df96a0a43
      </div>
    </div>
  );
};

export default GenerationControls;
