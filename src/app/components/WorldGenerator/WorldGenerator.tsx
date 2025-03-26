/**
 * WorldGenerator.tsx
 *
 * Main component that combines UI controls with the world map visualization.
 */

import React, { useState, useEffect } from "react";
import GenerationControls from "./UI/GenerationControls";
import WorldMap from "./WorldMap";
import {
  DEFAULT_SEED,
  WINDOW_WIDTH,
  WINDOW_HEIGHT,
  DEFAULT_TILE_SIZE,
  VisualizationMode,
  NOISE_DETAIL,
  NOISE_FALLOFF,
  DEFAULT_OCTAVES,
  DEFAULT_ELEVATION_SCALE,
  DEFAULT_MOISTURE_SCALE,
  DEFAULT_OCTAVE_WEIGHT,
  DEFAULT_EQUATOR_POSITION,
  DEFAULT_TEMPERATURE_VARIANCE,
  DEFAULT_ELEVATION_TEMP_EFFECT,
  DEFAULT_TEMPERATURE_BAND_SCALE,
  DEFAULT_TEMPERATURE_PARAMS,
  MOISTURE_THRESHOLDS,
  TEMPERATURE_THRESHOLDS,
  DEFAULT_RADIAL_PARAMS,
} from "./config";

export default function WorldGenerator() {
  // Basic settings
  const [seed, setSeed] = useState(DEFAULT_SEED);
  const [debug, setDebug] = useState(true);
  const [tileSize, setTileSize] = useState(DEFAULT_TILE_SIZE);
  // Add loading state for progress bar
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

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

  // Radial gradient settings
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

  // Threshold controls
  const [moistureThresholds, setMoistureThresholds] = useState({
    ...MOISTURE_THRESHOLDS,
  });
  const [temperatureThresholds, setTemperatureThresholds] = useState({
    ...TEMPERATURE_THRESHOLDS,
  });

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
    moistureThresholds,
    temperatureThresholds,
  });

  // Update visualization mode immediately
  useEffect(() => {
    setCurrentGenParams((prev) => ({
      ...prev,
      visualizationMode,
    }));
  }, [visualizationMode]);

  // Update thresholds immediately when they change
  useEffect(() => {
    setCurrentGenParams((prev) => ({
      ...prev,
      moistureThresholds,
      temperatureThresholds,
    }));
  }, [moistureThresholds, temperatureThresholds]);

  // Generate a new random seed
  const generateNewSeed = () => {
    // Generate a new random seed
    const newSeed = Math.floor(Math.random() * 10000);
    setSeed(newSeed);
    // Use the new seed to generate the world
    handleGenerateWorld(newSeed);
  };

  // Generate world with current parameters
  const handleGenerateWorld = (newSeed?: number) => {
    // Start generation progress
    setIsGenerating(true);
    setGenerationProgress(5);

    // Use timeout to allow UI to update before generation starts
    setTimeout(() => {
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
        // Use the provided seed or current seed value - don't randomize unless explicitly asked
        noiseSeed: (newSeed !== undefined ? newSeed : seed) + 2000,
      };

      // Update progress to show we're configuring
      setGenerationProgress(25);

      // Short delay to allow progress bar to update
      setTimeout(() => {
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
          moistureThresholds,
          temperatureThresholds,
        });

        // Update progress to show we're generating world data
        setGenerationProgress(50);

        // Allow render to happen before finishing progress
        setTimeout(() => {
          setGenerationProgress(75);
          setTimeout(() => {
            setGenerationProgress(100);
            setTimeout(() => {
              setIsGenerating(false);
            }, 300);
          }, 300);
        }, 300);
      }, 200);
    }, 100);
  };

  return (
    <div className="flex flex-col md:flex-row max-h-screen overflow-hidden">
      <div className="w-full md:w-1/3 lg:w-1/4 overflow-y-auto p-4 bg-gray-800">
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
          // New temperature controls
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
          // Threshold properties
          moistureThresholds={moistureThresholds}
          setMoistureThresholds={setMoistureThresholds}
          temperatureThresholds={temperatureThresholds}
          setTemperatureThresholds={setTemperatureThresholds}
          // Actions
          generateNewSeed={generateNewSeed}
          handleGenerateWorld={handleGenerateWorld}
        />
      </div>

      <div className="w-full md:w-2/3 lg:w-3/4 flex items-center justify-center bg-gray-900 relative">
        <WorldMap
          width={WINDOW_WIDTH}
          height={WINDOW_HEIGHT}
          tileSize={currentGenParams.tileSize}
          seed={currentGenParams.seed}
          debug={currentGenParams.debug}
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
          isGenerating={isGenerating}
          generationProgress={generationProgress}
        />
      </div>
    </div>
  );
}
