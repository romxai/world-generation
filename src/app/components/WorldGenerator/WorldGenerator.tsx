/**
 * WorldGenerator.tsx
 *
 * Main component that combines UI controls with the world map visualization.
 */

import React, { useState, useEffect, useCallback } from "react";
import GenerationControls from "./UI/GenerationControls";
import WorldMap from "./WorldMap";
import {
  DEFAULT_SEED,
  WINDOW_WIDTH,
  WINDOW_HEIGHT,
  DEFAULT_TILE_SIZE,
  BIOME_PRESETS,
  VisualizationMode,
  NOISE_DETAIL,
  NOISE_FALLOFF,
  calculateBiomeHeights,
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
  DEFAULT_CONTINENTAL_PARAMS,
  ContinentalFalloffParams,
} from "./config";

export default function WorldGenerator() {
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

  // UI state
  const [showWeightEditor, setShowWeightEditor] = useState(false);
  const [customWeights, setCustomWeights] = useState<number[]>([
    ...BIOME_PRESETS.WORLD.weights,
  ]);

  // Threshold controls
  const [moistureThresholds, setMoistureThresholds] = useState({
    ...MOISTURE_THRESHOLDS,
  });
  const [temperatureThresholds, setTemperatureThresholds] = useState({
    ...TEMPERATURE_THRESHOLDS,
  });

  // Resource controls
  const [resourceDensity, setResourceDensity] = useState<number>(0.25);
  const [resourceScale, setResourceScale] = useState<number>(150);

  // Continental falloff parameters
  const [continentalEnabled, setContinentalEnabled] = useState<boolean>(
    DEFAULT_CONTINENTAL_PARAMS.enabled || true
  );
  const [continentalScale, setContinentalScale] = useState<number>(
    DEFAULT_CONTINENTAL_PARAMS.scale || 180
  );
  const [continentalSharpness, setContinentalSharpness] = useState<number>(
    DEFAULT_CONTINENTAL_PARAMS.sharpness || 4.0
  );
  const [continentalThreshold, setContinentalThreshold] = useState<number>(
    DEFAULT_CONTINENTAL_PARAMS.threshold || 0.45
  );
  const [continentalStrength, setContinentalStrength] = useState<number>(
    DEFAULT_CONTINENTAL_PARAMS.strength || 0.6
  );
  const [continentalOceanDepth, setContinentalOceanDepth] = useState<number>(
    DEFAULT_CONTINENTAL_PARAMS.oceanDepth || 0.7
  );

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
    continentalFalloffParams: {
      enabled: continentalEnabled,
      scale: continentalScale,
      sharpness: continentalSharpness,
      threshold: continentalThreshold,
      strength: continentalStrength,
      oceanDepth: continentalOceanDepth,
      noiseOffset: DEFAULT_CONTINENTAL_PARAMS.noiseOffset,
    },
    moistureThresholds,
    temperatureThresholds,
    resourceDensity,
    resourceScale,
  });

  // Handle biome preset changes
  useEffect(() => {
    if (biomePreset === "CUSTOM") {
      setBiomeWeights([...customWeights]);
    } else {
      const preset = BIOME_PRESETS[biomePreset as keyof typeof BIOME_PRESETS];
      if (preset) {
        setBiomeWeights([...preset.weights]);

        // Update the custom weights when switching to custom preset
        if (biomePreset !== "CUSTOM") {
          setCustomWeights([...preset.weights]);
        }
      }
    }
  }, [biomePreset, customWeights]);

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

  // Update resource parameters immediately when they change
  useEffect(() => {
    setCurrentGenParams((prev) => ({
      ...prev,
      resourceDensity,
      resourceScale,
    }));
  }, [resourceDensity, resourceScale]);

  // Update continental params immediately when they change
  useEffect(() => {
    setCurrentGenParams((prev) => ({
      ...prev,
      continentalFalloffParams: {
        enabled: continentalEnabled,
        scale: continentalScale,
        sharpness: continentalSharpness,
        threshold: continentalThreshold,
        strength: continentalStrength,
        oceanDepth: continentalOceanDepth,
        noiseOffset: DEFAULT_CONTINENTAL_PARAMS.noiseOffset,
      },
    }));
  }, [
    continentalEnabled,
    continentalScale,
    continentalSharpness,
    continentalThreshold,
    continentalStrength,
    continentalOceanDepth,
  ]);

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
      continentalFalloffParams: {
        enabled: continentalEnabled,
        scale: continentalScale,
        sharpness: continentalSharpness,
        threshold: continentalThreshold,
        strength: continentalStrength,
        oceanDepth: continentalOceanDepth,
        noiseOffset: DEFAULT_CONTINENTAL_PARAMS.noiseOffset,
      },
      moistureThresholds,
      temperatureThresholds,
      resourceDensity,
      resourceScale,
    });
  };

  // Resource handlers
  const handleResourceDensityChange = useCallback((value: number) => {
    setResourceDensity(value);
  }, []);

  const handleResourceScaleChange = useCallback((value: number) => {
    setResourceScale(value);
  }, []);

  return (
    <div className="flex flex-col md:flex-row w-full h-full gap-4">
      <div className="w-full md:w-1/3 lg:w-1/4 overflow-y-auto max-h-screen p-4 bg-gray-800 text-white">
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
          // Continental falloff properties
          continentalEnabled={continentalEnabled}
          setContinentalEnabled={setContinentalEnabled}
          continentalSharpness={continentalSharpness}
          setContinentalSharpness={setContinentalSharpness}
          continentalScale={continentalScale}
          setContinentalScale={setContinentalScale}
          continentalThreshold={continentalThreshold}
          setContinentalThreshold={setContinentalThreshold}
          continentalStrength={continentalStrength}
          setContinentalStrength={setContinentalStrength}
          continentalOceanDepth={continentalOceanDepth}
          setContinentalOceanDepth={setContinentalOceanDepth}
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
          // Threshold controls
          moistureThresholds={moistureThresholds}
          setMoistureThresholds={setMoistureThresholds}
          temperatureThresholds={temperatureThresholds}
          setTemperatureThresholds={setTemperatureThresholds}
          // Resource controls
          resourceDensity={resourceDensity}
          resourceScale={resourceScale}
          onResourceDensityChange={handleResourceDensityChange}
          onResourceScaleChange={handleResourceScaleChange}
        />
      </div>

      <div className="flex-1 h-screen bg-black relative">
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
          continentalFalloffParams={currentGenParams.continentalFalloffParams}
          moistureThresholds={currentGenParams.moistureThresholds}
          temperatureThresholds={currentGenParams.temperatureThresholds}
          resourceDensity={currentGenParams.resourceDensity}
          resourceScale={currentGenParams.resourceScale}
        />
      </div>
    </div>
  );
}
