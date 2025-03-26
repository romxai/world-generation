"use client";

import React, { useState, useEffect } from "react";
import WorldMap from "./components/WorldGenerator/WorldMap";
import {
  DEFAULT_SEED,
  WINDOW_WIDTH,
  WINDOW_HEIGHT,
  DEFAULT_TILE_SIZE,
  WORLD_GRID_WIDTH,
  WORLD_GRID_HEIGHT,
  VisualizationMode,
  NOISE_DETAIL,
  NOISE_FALLOFF,
  DEFAULT_OCTAVES,
  DEFAULT_ELEVATION_SCALE,
  DEFAULT_MOISTURE_SCALE,
  DEFAULT_OCTAVE_WEIGHT,
  BIOME_NAMES,
  BiomeType,
  DEFAULT_EQUATOR_POSITION,
  DEFAULT_TEMPERATURE_VARIANCE,
  DEFAULT_ELEVATION_TEMP_EFFECT,
  DEFAULT_TEMPERATURE_BAND_SCALE,
  DEFAULT_TEMPERATURE_PARAMS,
  DEFAULT_RADIAL_PARAMS,
  ResourceType,
  ResourceConfig,
  DEFAULT_RESOURCE_CONFIGS,
} from "./components/WorldGenerator/config";
import GenerationControls from "./components/WorldGenerator/UI/GenerationControls";

export default function Home() {
  // Basic settings
  const [seed, setSeed] = useState(DEFAULT_SEED);
  const [debug, setDebug] = useState(true);
  const [tileSize, setTileSize] = useState(DEFAULT_TILE_SIZE);

  // Visualization and biome settings
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>(
    VisualizationMode.BIOME
  );

  // Advanced noise settings
  const [noiseDetail, setNoiseDetail] = useState<number>(NOISE_DETAIL);
  const [noiseFalloff, setNoiseFalloff] = useState<number>(NOISE_FALLOFF);

  // Multi-octave noise settings
  const [elevationOctaves, setElevationOctaves] =
    useState<number>(DEFAULT_OCTAVES);
  const [moistureOctaves, setMoistureOctaves] =
    useState<number>(DEFAULT_OCTAVES);
  const [elevationScale, setElevationScale] = useState<number>(
    DEFAULT_ELEVATION_SCALE
  );
  const [moistureScale, setMoistureScale] = useState<number>(
    DEFAULT_MOISTURE_SCALE
  );
  const [elevationPersistence, setElevationPersistence] = useState<number>(
    DEFAULT_OCTAVE_WEIGHT
  );
  const [moisturePersistence, setMoisturePersistence] = useState<number>(
    DEFAULT_OCTAVE_WEIGHT
  );

  // Temperature settings
  const [equatorPosition, setEquatorPosition] = useState<number>(
    DEFAULT_EQUATOR_POSITION
  );
  const [temperatureVariance, setTemperatureVariance] = useState<number>(
    DEFAULT_TEMPERATURE_VARIANCE
  );
  const [elevationTempEffect, setElevationTempEffect] = useState<number>(
    DEFAULT_ELEVATION_TEMP_EFFECT
  );
  const [temperatureBandScale, setTemperatureBandScale] = useState<number>(
    DEFAULT_TEMPERATURE_BAND_SCALE
  );
  const [temperatureNoiseScale, setTemperatureNoiseScale] = useState<number>(
    DEFAULT_TEMPERATURE_PARAMS.noiseScale || 8.0
  );
  const [temperatureNoiseOctaves, setTemperatureNoiseOctaves] =
    useState<number>(DEFAULT_TEMPERATURE_PARAMS.noiseOctaves || 2);
  const [temperatureNoisePersistence, setTemperatureNoisePersistence] =
    useState<number>(DEFAULT_TEMPERATURE_PARAMS.noisePersistence || 0.4);
  const [polarTemperature, setPolarTemperature] = useState<number>(
    DEFAULT_TEMPERATURE_PARAMS.polarTemperature || 0.1
  );
  const [equatorTemperature, setEquatorTemperature] = useState<number>(
    DEFAULT_TEMPERATURE_PARAMS.equatorTemperature || 0.9
  );

  // Radial gradient settings for ocean effect
  const [radialCenterX, setRadialCenterX] = useState<number>(
    DEFAULT_RADIAL_PARAMS.centerX || 0.5
  );
  const [radialCenterY, setRadialCenterY] = useState<number>(
    DEFAULT_RADIAL_PARAMS.centerY || 0.5
  );
  const [radialRadius, setRadialRadius] = useState<number>(
    DEFAULT_RADIAL_PARAMS.radius || 0.6
  );
  const [radialFalloffExponent, setRadialFalloffExponent] = useState<number>(
    DEFAULT_RADIAL_PARAMS.falloffExponent || 3
  );
  const [radialStrength, setRadialStrength] = useState<number>(
    DEFAULT_RADIAL_PARAMS.strength || 0.7
  );

  // Resource settings
  const [resourceConfigs, setResourceConfigs] = useState<
    Record<ResourceType, ResourceConfig>
  >(DEFAULT_RESOURCE_CONFIGS);

  // Controls UI state
  const [showControls, setShowControls] = useState(true);

  // Generation state
  const [currentGenParams, setCurrentGenParams] = useState({
    seed,
    debug,
    tileSize,
    visualizationMode,
    noiseDetail,
    noiseFalloff,
    elevationOctaves,
    moistureOctaves,
    elevationScale,
    moistureScale,
    elevationPersistence,
    moisturePersistence,
    temperatureParams: {
      equatorPosition,
      temperatureVariance,
      elevationEffect: elevationTempEffect,
      bandScale: temperatureBandScale,
      noiseScale: temperatureNoiseScale,
      noiseOctaves: temperatureNoiseOctaves,
      noisePersistence: temperatureNoisePersistence,
      polarTemperature: polarTemperature,
      equatorTemperature: equatorTemperature,
      noiseSeed: seed + 2000,
    },
    radialGradientParams: {
      centerX: radialCenterX,
      centerY: radialCenterY,
      radius: radialRadius,
      falloffExponent: radialFalloffExponent,
      strength: radialStrength,
    },
    resourceConfigs: resourceConfigs,
  });

  // Update visualization mode immediately
  useEffect(() => {
    setCurrentGenParams((prev) => ({
      ...prev,
      visualizationMode,
    }));
  }, [visualizationMode]);

  // Generate a new random seed
  const generateNewSeed = () => {
    const newSeed = Math.floor(Math.random() * 10000);
    setSeed(newSeed);
    handleGenerateWorld(newSeed);
  };

  // Generate world with current parameters
  const handleGenerateWorld = (newSeed?: number) => {
    // Create the temperature parameters object
    const tempParams = {
      equatorPosition,
      temperatureVariance,
      elevationEffect: elevationTempEffect,
      bandScale: temperatureBandScale,
      noiseScale: temperatureNoiseScale,
      noiseOctaves: temperatureNoiseOctaves,
      noisePersistence: temperatureNoisePersistence,
      polarTemperature: polarTemperature,
      equatorTemperature: equatorTemperature,
      noiseSeed: newSeed !== undefined ? newSeed + 2000 : seed + 2000,
    };

    setCurrentGenParams({
      seed: newSeed !== undefined ? newSeed : seed,
      debug,
      tileSize,
      visualizationMode,
      noiseDetail,
      noiseFalloff,
      elevationOctaves,
      moistureOctaves,
      elevationScale,
      moistureScale,
      elevationPersistence,
      moisturePersistence,
      temperatureParams: tempParams,
      radialGradientParams: {
        centerX: radialCenterX,
        centerY: radialCenterY,
        radius: radialRadius,
        falloffExponent: radialFalloffExponent,
        strength: radialStrength,
      },
      resourceConfigs: resourceConfigs,
    });
  };

  return (
    <main className="flex min-h-screen flex-col bg-gray-900 text-white">
      <div className="p-4 bg-black bg-opacity-50 shadow-md mb-4 w-full">
        <h1 className="text-2xl font-bold">Procedural World Generator</h1>
        <div className="mt-2 flex justify-between items-center">
          <button
            onClick={() => setShowControls(!showControls)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
          >
            {showControls ? "Hide Controls" : "Show Controls"}
          </button>
          <div>
            <button
              onClick={generateNewSeed}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition mr-2"
            >
              Generate New World
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        {showControls && (
          <div className="w-full md:w-1/3 lg:w-1/4 overflow-y-auto max-h-screen p-4 bg-gray-800">
            <GenerationControls
              // Basic properties
              seed={seed}
              setSeed={setSeed}
              visualizationMode={visualizationMode}
              setVisualizationMode={setVisualizationMode}
              // Noise properties
              noiseDetail={noiseDetail}
              setNoiseDetail={setNoiseDetail}
              noiseFalloff={noiseFalloff}
              setNoiseFalloff={setNoiseFalloff}
              elevationOctaves={elevationOctaves}
              setElevationOctaves={setElevationOctaves}
              moistureOctaves={moistureOctaves}
              setMoistureOctaves={setMoistureOctaves}
              elevationScale={elevationScale}
              setElevationScale={setElevationScale}
              moistureScale={moistureScale}
              setMoistureScale={setMoistureScale}
              elevationPersistence={elevationPersistence}
              setElevationPersistence={setElevationPersistence}
              moisturePersistence={moisturePersistence}
              setMoisturePersistence={setMoisturePersistence}
              // Climate properties
              equatorPosition={equatorPosition}
              setEquatorPosition={setEquatorPosition}
              temperatureVariance={temperatureVariance}
              setTemperatureVariance={setTemperatureVariance}
              elevationTempEffect={elevationTempEffect}
              setElevationTempEffect={setElevationTempEffect}
              temperatureBandScale={temperatureBandScale}
              setTemperatureBandScale={setTemperatureBandScale}
              temperatureNoiseScale={temperatureNoiseScale}
              setTemperatureNoiseScale={setTemperatureNoiseScale}
              temperatureNoiseOctaves={temperatureNoiseOctaves}
              setTemperatureNoiseOctaves={setTemperatureNoiseOctaves}
              temperatureNoisePersistence={temperatureNoisePersistence}
              setTemperatureNoisePersistence={setTemperatureNoisePersistence}
              polarTemperature={polarTemperature}
              setPolarTemperature={setPolarTemperature}
              equatorTemperature={equatorTemperature}
              setEquatorTemperature={setEquatorTemperature}
              // Radial gradient properties
              radialCenterX={radialCenterX}
              setRadialCenterX={setRadialCenterX}
              radialCenterY={radialCenterY}
              setRadialCenterY={setRadialCenterY}
              radialRadius={radialRadius}
              setRadialRadius={setRadialRadius}
              radialFalloffExponent={radialFalloffExponent}
              setRadialFalloffExponent={setRadialFalloffExponent}
              radialStrength={radialStrength}
              setRadialStrength={setRadialStrength}
              // Resource properties
              resourceConfigs={resourceConfigs}
              setResourceConfigs={setResourceConfigs}
              // Actions
              generateNewSeed={generateNewSeed}
            />
            <div className="mt-4">
              <button
                onClick={() => handleGenerateWorld()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition w-full"
              >
                Apply Settings
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 p-0 overflow-hidden">
          <WorldMap {...currentGenParams} />
        </div>
      </div>
    </main>
  );
}
