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
  BIOME_PRESETS,
  TerrainType,
  VisualizationMode,
  TERRAIN_NAMES,
  NOISE_DETAIL,
  NOISE_FALLOFF,
  calculateTerrainHeights,
  ALL_TERRAIN_TYPES,
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
} from "./components/WorldGenerator/config";
import GenerationControls from "./components/WorldGenerator/UI/GenerationControls";
import { DEFAULT_RADIAL_PARAMS } from "./components/WorldGenerator/radialUtils";

export default function Home() {
  // Basic settings
  const [seed, setSeed] = useState(DEFAULT_SEED);
  const [debug, setDebug] = useState(true);
  const [tileSize, setTileSize] = useState(DEFAULT_TILE_SIZE);

  // Visualization and biome settings
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>(
    VisualizationMode.BIOME
  );
  const [biomePreset, setBiomePreset] = useState<string>("WORLD");
  const [biomeWeights, setBiomeWeights] = useState<number[]>(
    BIOME_PRESETS.WORLD
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

  // UI state
  const [showWeightEditor, setShowWeightEditor] = useState(false);
  const [customWeights, setCustomWeights] = useState<number[]>([
    ...BIOME_PRESETS.WORLD,
  ]);

  // Controls UI state
  const [showControls, setShowControls] = useState(true);

  // Generation state
  const [currentGenParams, setCurrentGenParams] = useState({
    seed,
    debug,
    tileSize,
    visualizationMode,
    biomeWeights: [...biomeWeights],
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
    },
    radialGradientParams: {
      centerX: radialCenterX,
      centerY: radialCenterY,
      radius: radialRadius,
      falloffExponent: radialFalloffExponent,
      strength: radialStrength,
    },
  });

  // Recalculate terrain heights preview when weights change
  const [terrainHeightsPreview, setTerrainHeightsPreview] = useState(
    calculateTerrainHeights(biomeWeights)
  );

  // Handle biome preset changes
  useEffect(() => {
    if (biomePreset === "CUSTOM") {
      setBiomeWeights([...customWeights]);
    } else {
      const preset = BIOME_PRESETS[biomePreset as keyof typeof BIOME_PRESETS];
      if (preset) {
        setBiomeWeights([...preset]);

        // Update the custom weights when switching to custom preset
        // This helps users start with the currently selected preset as a base
        if (biomePreset !== "CUSTOM") {
          setCustomWeights([...preset]);
        }
      }
    }
  }, [biomePreset, customWeights]);

  // Update terrain heights preview when weights change
  useEffect(() => {
    setTerrainHeightsPreview(calculateTerrainHeights(biomeWeights));
  }, [biomeWeights]);

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

  // Handle custom weight changes
  const handleWeightChange = (index: number, value: number) => {
    const newWeights = [...customWeights];
    newWeights[index] = Math.max(0, value); // Ensure weights are non-negative
    setCustomWeights(newWeights);

    // If currently using custom preset, update the active weights
    if (biomePreset === "CUSTOM") {
      setBiomeWeights([...newWeights]);
    }
  };

  // Apply custom weights and switch to custom preset
  const applyCustomWeights = () => {
    setBiomePreset("CUSTOM");
    setBiomeWeights([...customWeights]);
  };

  // Generate world with current parameters
  const handleGenerateWorld = (newSeed?: number) => {
    setCurrentGenParams({
      seed: newSeed !== undefined ? newSeed : seed,
      debug,
      tileSize,
      visualizationMode,
      biomeWeights: [...biomeWeights],
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
      },
      radialGradientParams: {
        centerX: radialCenterX,
        centerY: radialCenterY,
        radius: radialRadius,
        falloffExponent: radialFalloffExponent,
        strength: radialStrength,
      },
    });
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-2">Procedural World Generator</h1>

      <div className="w-full max-w-6xl flex justify-between items-center mb-3">
        <button
          onClick={() => setShowControls(!showControls)}
          className="bg-blue-700 px-4 py-2 rounded-lg hover:bg-blue-800 transition"
        >
          {showControls ? "Hide Controls" : "Show Controls"}
        </button>

        <button
          onClick={() => handleGenerateWorld()}
          className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition text-lg font-semibold"
        >
          Generate World
        </button>
      </div>

      {showControls && (
        <div className="w-full max-w-6xl mb-4">
          {/* Main controls using the new UI components */}
          <GenerationControls
            // Basic properties
            seed={seed}
            setSeed={setSeed}
            visualizationMode={visualizationMode}
            setVisualizationMode={setVisualizationMode}
            biomePreset={biomePreset}
            setBiomePreset={setBiomePreset}
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
            // Biome properties
            biomeWeights={biomeWeights}
            setBiomeWeights={setBiomeWeights}
            customWeights={customWeights}
            setCustomWeights={setCustomWeights}
            // UI state
            showWeightEditor={showWeightEditor}
            setShowWeightEditor={setShowWeightEditor}
            // Actions
            generateNewSeed={generateNewSeed}
            applyCustomWeights={applyCustomWeights}
          />
        </div>
      )}

      {/* The world map visualization */}
      <div
        className={`w-full max-w-6xl ${
          !showControls ? "mt-3" : ""
        } mb-4 relative bg-black rounded-lg overflow-hidden`}
      >
        <WorldMap
          width={WINDOW_WIDTH}
          height={WINDOW_HEIGHT}
          tileSize={currentGenParams.tileSize}
          seed={currentGenParams.seed}
          debug={currentGenParams.debug}
          biomeWeights={currentGenParams.biomeWeights}
          noiseDetail={currentGenParams.noiseDetail}
          noiseFalloff={currentGenParams.noiseFalloff}
          visualizationMode={currentGenParams.visualizationMode}
          elevationOctaves={currentGenParams.elevationOctaves}
          moistureOctaves={currentGenParams.moistureOctaves}
          elevationScale={currentGenParams.elevationScale}
          moistureScale={currentGenParams.moistureScale}
          elevationPersistence={currentGenParams.elevationPersistence}
          moisturePersistence={currentGenParams.moisturePersistence}
          temperatureParams={currentGenParams.temperatureParams}
          radialGradientParams={currentGenParams.radialGradientParams}
        />
      </div>

      <footer className="text-sm text-gray-500 mt-4">
        Use mouse wheel to zoom, drag to pan, and click "Generate World" to
        apply your changes.
      </footer>
    </div>
  );
}
