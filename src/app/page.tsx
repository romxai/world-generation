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
  VisualizationMode,
  NOISE_DETAIL,
  NOISE_FALLOFF,
  calculateBiomeHeights,
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
  MOISTURE_THRESHOLDS,
  TEMPERATURE_THRESHOLDS,
  ELEVATION_THRESHOLDS,
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
  const [biomePreset, setBiomePreset] = useState<string>("WORLD");
  const [biomeWeights, setBiomeWeights] = useState<number[]>(
    BIOME_PRESETS.WORLD.weights
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

  // UI state
  const [showWeightEditor, setShowWeightEditor] = useState(false);
  const [customWeights, setCustomWeights] = useState<number[]>([
    ...BIOME_PRESETS.WORLD.weights,
  ]);

  // Controls UI state
  const [showControls, setShowControls] = useState(true);

  // Add threshold states
  const [moistureThresholds, setMoistureThresholds] =
    useState(MOISTURE_THRESHOLDS);
  const [temperatureThresholds, setTemperatureThresholds] = useState(
    TEMPERATURE_THRESHOLDS
  );

  // Add elevation thresholds state
  const [elevationThresholds, setElevationThresholds] =
    useState(ELEVATION_THRESHOLDS);

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
    moistureThresholds,
    temperatureThresholds,
    elevationThresholds,
  });

  // Recalculate terrain heights preview when weights change
  const [terrainHeightsPreview, setTerrainHeightsPreview] = useState(
    calculateBiomeHeights(biomeWeights)
  );

  // Handle biome preset changes
  useEffect(() => {
    if (biomePreset === "CUSTOM") {
      setBiomeWeights([...customWeights]);
    } else {
      const preset = BIOME_PRESETS[biomePreset as keyof typeof BIOME_PRESETS];
      if (preset) {
        //setBiomeWeights([...preset]);

        // Update the custom weights when switching to custom preset
        // This helps users start with the currently selected preset as a base
        if (biomePreset !== "CUSTOM") {
          //setCustomWeights([...preset]);
        }
      }
    }
  }, [biomePreset, customWeights]);

  // Update terrain heights preview when weights change
  useEffect(() => {
    setTerrainHeightsPreview(calculateBiomeHeights(biomeWeights));
  }, [biomeWeights]);

  // Update visualization mode immediately
  useEffect(() => {
    setCurrentGenParams((prev) => ({
      ...prev,
      visualizationMode,
    }));
  }, [visualizationMode]);

  // Add a useEffect to update the currentGenParams immediately when thresholds change
  useEffect(() => {
    // Update current generation parameters when thresholds change
    setCurrentGenParams((prev) => ({
      ...prev,
      moistureThresholds,
      temperatureThresholds,
      elevationThresholds,
    }));
  }, [moistureThresholds, temperatureThresholds, elevationThresholds]);

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

    // Log temperature parameters to confirm
    console.log("Temperature params:", tempParams);

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
      temperatureParams: tempParams,
      radialGradientParams: {
        centerX: radialCenterX,
        centerY: radialCenterY,
        radius: radialRadius,
        falloffExponent: radialFalloffExponent,
        strength: radialStrength,
      },
      moistureThresholds,
      temperatureThresholds,
      elevationThresholds,
    });
  };

  // Add useEffect for handling configuration import events
  useEffect(() => {
    // Event handler for configuration import
    const handleConfigImport = (event: CustomEvent) => {
      const importedConfig = event.detail;

      // Update basic settings
      if (importedConfig.seed !== undefined) setSeed(importedConfig.seed);
      if (importedConfig.basic?.tileSize !== undefined)
        setTileSize(importedConfig.basic.tileSize);

      // Update noise settings
      if (importedConfig.noise?.detail !== undefined)
        setNoiseDetail(importedConfig.noise.detail);
      if (importedConfig.noise?.falloff !== undefined)
        setNoiseFalloff(importedConfig.noise.falloff);
      if (importedConfig.noise?.elevation?.octaves !== undefined)
        setElevationOctaves(importedConfig.noise.elevation.octaves);
      if (importedConfig.noise?.moisture?.octaves !== undefined)
        setMoistureOctaves(importedConfig.noise.moisture.octaves);
      if (importedConfig.noise?.elevation?.scale !== undefined)
        setElevationScale(importedConfig.noise.elevation.scale);
      if (importedConfig.noise?.moisture?.scale !== undefined)
        setMoistureScale(importedConfig.noise.moisture.scale);
      if (importedConfig.noise?.elevation?.persistence !== undefined)
        setElevationPersistence(importedConfig.noise.elevation.persistence);
      if (importedConfig.noise?.moisture?.persistence !== undefined)
        setMoisturePersistence(importedConfig.noise.moisture.persistence);

      // Update temperature settings
      if (importedConfig.temperature?.equatorPosition !== undefined)
        setEquatorPosition(importedConfig.temperature.equatorPosition);
      if (importedConfig.temperature?.temperatureVariance !== undefined)
        setTemperatureVariance(importedConfig.temperature.temperatureVariance);
      if (importedConfig.temperature?.elevationEffect !== undefined)
        setElevationTempEffect(importedConfig.temperature.elevationEffect);
      if (importedConfig.temperature?.bandScale !== undefined)
        setTemperatureBandScale(importedConfig.temperature.bandScale);
      if (importedConfig.temperature?.noiseScale !== undefined)
        setTemperatureNoiseScale(importedConfig.temperature.noiseScale);
      if (importedConfig.temperature?.noiseOctaves !== undefined)
        setTemperatureNoiseOctaves(importedConfig.temperature.noiseOctaves);
      if (importedConfig.temperature?.noisePersistence !== undefined)
        setTemperatureNoisePersistence(
          importedConfig.temperature.noisePersistence
        );
      if (importedConfig.temperature?.polarTemperature !== undefined)
        setPolarTemperature(importedConfig.temperature.polarTemperature);
      if (importedConfig.temperature?.equatorTemperature !== undefined)
        setEquatorTemperature(importedConfig.temperature.equatorTemperature);

      // Update radial gradient settings
      if (importedConfig.radialGradient?.centerX !== undefined)
        setRadialCenterX(importedConfig.radialGradient.centerX);
      if (importedConfig.radialGradient?.centerY !== undefined)
        setRadialCenterY(importedConfig.radialGradient.centerY);
      if (importedConfig.radialGradient?.radius !== undefined)
        setRadialRadius(importedConfig.radialGradient.radius);
      if (importedConfig.radialGradient?.falloffExponent !== undefined)
        setRadialFalloffExponent(importedConfig.radialGradient.falloffExponent);
      if (importedConfig.radialGradient?.strength !== undefined)
        setRadialStrength(importedConfig.radialGradient.strength);

      // Update biome weights
      if (importedConfig.biomes?.weights) {
        setBiomeWeights([...importedConfig.biomes.weights]);
        setCustomWeights([...importedConfig.biomes.weights]);
        setBiomePreset("CUSTOM");
      }

      // Note: Threshold values are already handled in ThresholdControls component

      console.log("Configuration imported successfully");
    };

    // Add event listener
    window.addEventListener(
      "config-imported",
      handleConfigImport as EventListener
    );

    // Cleanup
    return () => {
      window.removeEventListener(
        "config-imported",
        handleConfigImport as EventListener
      );
    };
  }, []); // Empty dependency array to avoid re-registering the listener

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
            // Add the new temperature controls
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
            // Add threshold properties
            moistureThresholds={moistureThresholds}
            setMoistureThresholds={setMoistureThresholds}
            temperatureThresholds={temperatureThresholds}
            setTemperatureThresholds={setTemperatureThresholds}
            elevationThresholds={elevationThresholds}
            setElevationThresholds={setElevationThresholds}
          />
        </div>
      )}

      {/* The world map visualization */}
      <div
        className="w-full max-w-6xl mb-4 relative bg-black rounded-lg overflow-hidden"
        style={{ height: "70vh" }}
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
          moistureThresholds={currentGenParams.moistureThresholds}
          temperatureThresholds={currentGenParams.temperatureThresholds}
          elevationThresholds={currentGenParams.elevationThresholds}
        />
      </div>

      <footer className="text-sm text-gray-500 mt-4">
        Use mouse wheel to zoom, drag to pan, and click "Generate World" to
        apply your changes.
      </footer>
    </div>
  );
}
