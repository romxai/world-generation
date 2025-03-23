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
} from "./components/WorldGenerator/config";

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

  // New multi-octave noise settings
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

  // UI state
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showNoiseSettings, setShowNoiseSettings] = useState(false);
  const [showWeightEditor, setShowWeightEditor] = useState(false);
  const [customWeights, setCustomWeights] = useState<number[]>([
    ...BIOME_PRESETS.WORLD,
  ]);

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

  // Generate a new random seed
  const generateNewSeed = () => {
    setSeed(Math.floor(Math.random() * 10000));
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

  return (
    <div className="min-h-screen p-4 flex flex-col items-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-2">Procedural World Generator</h1>

      <div className="w-full max-w-6xl mb-4">
        {/* Main controls panel */}
        <div className="bg-gray-800 p-4 rounded-lg mb-4">
          <h2 className="text-xl font-semibold mb-3">Map Controls</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Seed section */}
            <div className="bg-gray-700 p-3 rounded-md">
              <h3 className="font-medium mb-2">World Seed</h3>
              <div className="flex items-center gap-2">
                <input
                  id="seed"
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(Number(e.target.value))}
                  className="bg-gray-800 px-2 py-1 rounded w-24 text-white"
                />
                <button
                  onClick={generateNewSeed}
                  className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 text-sm"
                >
                  Random
                </button>
              </div>
            </div>

            {/* Visualization mode */}
            <div className="bg-gray-700 p-3 rounded-md">
              <h3 className="font-medium mb-2">Visualization</h3>
              <select
                value={visualizationMode}
                onChange={(e) =>
                  setVisualizationMode(e.target.value as VisualizationMode)
                }
                className="bg-gray-800 px-2 py-1 rounded w-full text-white"
              >
                <option value={VisualizationMode.BIOME}>Biome Colors</option>
                <option value={VisualizationMode.NOISE}>Raw Noise</option>
                <option value={VisualizationMode.ELEVATION}>Elevation</option>
                <option value={VisualizationMode.MOISTURE}>Moisture</option>
                <option value={VisualizationMode.TEMPERATURE}>
                  Temperature
                </option>
                <option value={VisualizationMode.WEIGHT_DISTRIBUTION}>
                  Weight Distribution
                </option>
              </select>
            </div>

            {/* Biome preset section */}
            <div className="bg-gray-700 p-3 rounded-md">
              <h3 className="font-medium mb-2">Biome Preset</h3>
              <div className="flex flex-col gap-2">
                <select
                  value={biomePreset}
                  onChange={(e) => setBiomePreset(e.target.value)}
                  className="bg-gray-800 px-2 py-1 rounded w-full text-white"
                >
                  <option value="WORLD">World Map</option>
                  <option value="CONTINENTS">Continents</option>
                  <option value="ISLANDS">Islands</option>
                  <option value="CUSTOM">Custom</option>
                </select>
                <button
                  onClick={() => setShowWeightEditor(!showWeightEditor)}
                  className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 text-sm"
                >
                  {showWeightEditor ? "Hide Weight Editor" : "Edit Weights"}
                </button>
              </div>
            </div>
          </div>

          {/* Advanced controls toggle */}
          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
            >
              {showAdvancedSettings ? "▼ " : "► "}
              Advanced Settings
            </button>

            <button
              onClick={() => setShowNoiseSettings(!showNoiseSettings)}
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
            >
              {showNoiseSettings ? "▼ " : "► "}
              Noise Generator Settings
            </button>
          </div>

          {/* Advanced settings */}
          {showAdvancedSettings && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-700 p-3 rounded-md">
                <h3 className="font-medium mb-2">Noise Detail</h3>
                <div className="flex flex-col gap-1">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={noiseDetail}
                    onChange={(e) => setNoiseDetail(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between">
                    <span className="text-xs">Low ({noiseDetail})</span>
                    <span className="text-xs">High</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 p-3 rounded-md">
                <h3 className="font-medium mb-2">Noise Falloff</h3>
                <div className="flex flex-col gap-1">
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={noiseFalloff}
                    onChange={(e) => setNoiseFalloff(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between">
                    <span className="text-xs">Smooth ({noiseFalloff})</span>
                    <span className="text-xs">Rough</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 p-3 rounded-md">
                <h3 className="font-medium mb-2">Tile Size</h3>
                <select
                  id="tileSize"
                  value={tileSize}
                  onChange={(e) => setTileSize(Number(e.target.value))}
                  className="bg-gray-800 px-2 py-1 rounded w-full text-white"
                >
                  <option value="8">8px</option>
                  <option value="16">16px</option>
                  <option value="32">32px</option>
                  <option value="64">64px</option>
                </select>
              </div>

              <div className="bg-gray-700 p-3 rounded-md">
                <h3 className="font-medium mb-2">Debug Mode</h3>
                <div className="flex items-center gap-2">
                  <input
                    id="debug"
                    type="checkbox"
                    checked={debug}
                    onChange={(e) => setDebug(e.target.checked)}
                    className="bg-gray-800 rounded h-5 w-5"
                  />
                  <label htmlFor="debug">Show Debug Information</label>
                </div>
              </div>
            </div>
          )}

          {/* Noise Generator Settings */}
          {showNoiseSettings && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Elevation Noise Settings */}
              <div className="bg-gray-700 p-3 rounded-md">
                <h3 className="font-medium mb-2">Elevation Noise Settings</h3>

                <div className="mb-2">
                  <label className="block text-sm mb-1">Octaves</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="8"
                      value={elevationOctaves}
                      onChange={(e) =>
                        setElevationOctaves(Number(e.target.value))
                      }
                      className="w-full"
                    />
                    <span className="text-xs">{elevationOctaves}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Higher values add more detail
                  </p>
                </div>

                <div className="mb-2">
                  <label className="block text-sm mb-1">Scale</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="50"
                      max="500"
                      step="10"
                      value={elevationScale}
                      onChange={(e) =>
                        setElevationScale(Number(e.target.value))
                      }
                      className="w-full"
                    />
                    <span className="text-xs">{elevationScale}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Higher values create larger land features
                  </p>
                </div>

                <div>
                  <label className="block text-sm mb-1">Persistence</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.05"
                      value={elevationPersistence}
                      onChange={(e) =>
                        setElevationPersistence(Number(e.target.value))
                      }
                      className="w-full"
                    />
                    <span className="text-xs">{elevationPersistence}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    How much detail each octave adds
                  </p>
                </div>
              </div>

              {/* Moisture Noise Settings */}
              <div className="bg-gray-700 p-3 rounded-md">
                <h3 className="font-medium mb-2">Moisture Noise Settings</h3>

                <div className="mb-2">
                  <label className="block text-sm mb-1">Octaves</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="8"
                      value={moistureOctaves}
                      onChange={(e) =>
                        setMoistureOctaves(Number(e.target.value))
                      }
                      className="w-full"
                    />
                    <span className="text-xs">{moistureOctaves}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Higher values add more detail
                  </p>
                </div>

                <div className="mb-2">
                  <label className="block text-sm mb-1">Scale</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="50"
                      max="500"
                      step="10"
                      value={moistureScale}
                      onChange={(e) => setMoistureScale(Number(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-xs">{moistureScale}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Higher values create larger moisture regions
                  </p>
                </div>

                <div>
                  <label className="block text-sm mb-1">Persistence</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.05"
                      value={moisturePersistence}
                      onChange={(e) =>
                        setMoisturePersistence(Number(e.target.value))
                      }
                      className="w-full"
                    />
                    <span className="text-xs">{moisturePersistence}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    How much detail each octave adds
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Weight editor panel */}
        {showWeightEditor && (
          <div className="bg-gray-800 p-4 rounded-lg mb-4">
            <h2 className="text-xl font-semibold mb-3">Biome Weight Editor</h2>
            <p className="text-sm text-gray-400 mb-2">
              Adjust the weight of each terrain type to change terrain
              distribution. Higher values mean more of that terrain type will
              appear in the world.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
              {customWeights.map((weight, index) => (
                <div key={index} className="bg-gray-700 p-3 rounded-md">
                  <div className="flex justify-between mb-1">
                    <h3 className="font-medium">
                      {TERRAIN_NAMES[index as TerrainType]}
                    </h3>
                    <div
                      className="w-5 h-5 rounded-sm"
                      style={{
                        backgroundColor:
                          index === TerrainType.OCEAN_DEEP
                            ? "rgb(30, 120, 200)"
                            : index === TerrainType.OCEAN_MEDIUM
                            ? "rgb(35, 140, 220)"
                            : index === TerrainType.OCEAN_SHALLOW
                            ? "rgb(40, 160, 230)"
                            : index === TerrainType.BEACH
                            ? "rgb(215, 192, 158)"
                            : index === TerrainType.GRASS
                            ? "rgb(2, 166, 155)"
                            : index === TerrainType.MOUNTAIN
                            ? "rgb(90, 90, 90)"
                            : "rgb(220, 220, 220)",
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={weight}
                      onChange={(e) =>
                        handleWeightChange(index, Number(e.target.value))
                      }
                      className="w-full"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={weight}
                      onChange={(e) =>
                        handleWeightChange(index, Number(e.target.value))
                      }
                      className="bg-gray-800 px-2 py-1 rounded w-14 text-white text-sm"
                    />
                  </div>

                  {/* Show resulting threshold range */}
                  <div className="text-xs text-gray-400 mt-1">
                    Range:{" "}
                    {terrainHeightsPreview[index as TerrainType].min.toFixed(2)}{" "}
                    -{" "}
                    {terrainHeightsPreview[index as TerrainType].max.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setBiomePreset("CUSTOM");
                  setBiomeWeights([...customWeights]);
                }}
                className="bg-blue-600 px-4 py-1 rounded hover:bg-blue-700"
              >
                Apply Custom Weights
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-6xl">
        <WorldMap
          seed={seed}
          debug={debug}
          tileSize={tileSize}
          biomeWeights={biomeWeights}
          noiseDetail={noiseDetail}
          noiseFalloff={noiseFalloff}
          visualizationMode={visualizationMode}
          elevationOctaves={elevationOctaves}
          moistureOctaves={moistureOctaves}
          elevationScale={elevationScale}
          moistureScale={moistureScale}
          elevationPersistence={elevationPersistence}
          moisturePersistence={moisturePersistence}
        />
      </div>

      <div className="mt-2 text-sm text-gray-400 max-w-3xl text-center">
        <p>
          This world is divided into a fixed {WORLD_GRID_WIDTH}x
          {WORLD_GRID_HEIGHT} grid of purchasable tiles. The map is generated
          using Perlin noise to create natural-looking terrain with islands and
          continents. Tiles are only rendered when they are visible in the
          viewport for better performance.
        </p>
      </div>
    </div>
  );
}
