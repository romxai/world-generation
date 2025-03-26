// Configuration for the procedurally generated world

// Window dimensions
export const WINDOW_WIDTH = 1080;
export const WINDOW_HEIGHT = 720;
export const DEFAULT_TILE_SIZE = 16; // Base tile size in pixels

// RGB color interface
export interface RGB {
  r: number;
  g: number;
  b: number;
}

// World dimensions
export const WORLD_GRID_WIDTH = 1080 * 1.2; // Fixed number of tiles in the world (x-axis)
export const WORLD_GRID_HEIGHT = 720 * 1.2; // Fixed number of tiles in the world (y-axis)

// Noise configuration
export const DEFAULT_SEED = 1; // Default seed for reproducible generation
export const NOISE_DETAIL = 9;
export const NOISE_ZOOM = 0.45; // Detail level for noise generation
export const NOISE_FALLOFF = 0.5; // Falloff rate for noise
export const DEFAULT_OCTAVES = 10; // Default number of octaves for noise
export const DEFAULT_OCTAVE_WEIGHT = 0.45; // Default weight for each octave
export const DEFAULT_MOISTURE_SCALE = 200; // Default scale for moisture noise (higher = larger features)
export const DEFAULT_ELEVATION_SCALE = 200; // Default scale for elevation noise (higher = larger features)

// Temperature & climate parameters
export interface TemperatureParams {
  equatorPosition?: number; // Where the equator is located (0-1, default 0.5)
  temperatureVariance?: number; // How much regional temperature varies (0-1, default 0.2)
  polarTemperature?: number; // Base temperature at poles (0-1, default 0.1)
  equatorTemperature?: number; // Base temperature at equator (0-1, default 0.9)
  elevationEffect?: number; // How much elevation affects temperature (0-1, default 0.3)
  bandScale?: number; // Scale factor for temperature bands (1.0 = normal)
  noiseSeed?: number; // Seed for regional temperature variations
  noiseScale?: number; // Scale of regional temperature variations
  noiseOctaves?: number; // Number of octaves for regional variations
  noisePersistence?: number; // Persistence for regional variations
}

// Temperature zones constants
export const TEMPERATURE_ZONES = {
  // Temperature ranges (0-1)
  FREEZING: 0.0,
  COLD: 0.25,
  COOL: 0.4,
  MILD: 0.5,
  WARM: 0.65,
  HOT: 0.8,
  SCORCHING: 1.0,
};

// Default temperature settings
export const DEFAULT_EQUATOR_POSITION = 0.5; // Where the equator is located (0-1)
export const DEFAULT_TEMPERATURE_VARIANCE = 0.08; // Regional variance for realism (reduced for smoother maps)
export const DEFAULT_ELEVATION_TEMP_EFFECT = 0.25; // How much elevation cools temperature
export const DEFAULT_TEMPERATURE_BAND_SCALE = 1.0; // Scale factor for temperature bands (1.0 = normal)
export const DEFAULT_POLAR_TEMPERATURE = 0.1; // Cold poles
export const DEFAULT_EQUATOR_TEMPERATURE = 0.9; // Hot equator
export const DEFAULT_TEMPERATURE_NOISE_SEED = 12345; // Default seed for regional variations
export const DEFAULT_TEMPERATURE_NOISE_SCALE = 8.0; // Scale for smoother regional temperature variations
export const DEFAULT_TEMPERATURE_NOISE_OCTAVES = 2; // Fewer octaves for smoother variations
export const DEFAULT_TEMPERATURE_NOISE_PERSISTENCE = 0.4; // Lower persistence for smoother gradients

// Combined temperature parameters
export const DEFAULT_TEMPERATURE_PARAMS: TemperatureParams = {
  equatorPosition: DEFAULT_EQUATOR_POSITION,
  temperatureVariance: DEFAULT_TEMPERATURE_VARIANCE,
  polarTemperature: DEFAULT_POLAR_TEMPERATURE,
  equatorTemperature: DEFAULT_EQUATOR_TEMPERATURE,
  elevationEffect: DEFAULT_ELEVATION_TEMP_EFFECT,
  bandScale: DEFAULT_TEMPERATURE_BAND_SCALE,
  noiseSeed: DEFAULT_TEMPERATURE_NOISE_SEED,
  noiseScale: DEFAULT_TEMPERATURE_NOISE_SCALE,
  noiseOctaves: DEFAULT_TEMPERATURE_NOISE_OCTAVES,
  noisePersistence: DEFAULT_TEMPERATURE_NOISE_PERSISTENCE,
};

// Radial gradient parameters
export interface RadialGradientParams {
  centerX?: number; // Center X position (0-1, default 0.5)
  centerY?: number; // Center Y position (0-1, default 0.5)
  radius?: number; // Normalized radius of the inner area (0-1, default 0.6)
  falloffExponent?: number; // Controls how sharp the transition is (default 3)
  strength?: number; // Overall strength of the effect (0-1, default 0.7)
}

// Default radial gradient settings
export const DEFAULT_RADIAL_CENTER_X = 0.5; // Center of the map
export const DEFAULT_RADIAL_CENTER_Y = 0.5; // Center of the map
export const DEFAULT_RADIAL_RADIUS = 0.6; // Inner radius covers 60% of the map
export const DEFAULT_RADIAL_FALLOFF_EXPONENT = 3; // Cubic falloff for smoother transition
export const DEFAULT_RADIAL_STRENGTH = 0.7; // 70% strength, balanced effect

// Combined radial gradient parameters
export const DEFAULT_RADIAL_PARAMS: RadialGradientParams = {
  centerX: DEFAULT_RADIAL_CENTER_X,
  centerY: DEFAULT_RADIAL_CENTER_Y,
  radius: DEFAULT_RADIAL_RADIUS,
  falloffExponent: DEFAULT_RADIAL_FALLOFF_EXPONENT,
  strength: DEFAULT_RADIAL_STRENGTH,
};

// Continental falloff parameters
export interface ContinentalFalloffParams {
  enabled?: boolean; // Whether continental falloff is enabled
  sharpness?: number; // How sharp the falloff around continents is (1-10)
  scale?: number; // Scale of the continental detection (50-500)
  threshold?: number; // Threshold for detecting continents (0-1)
  strength?: number; // Strength of the continental falloff effect (0-1)
  noiseOffset?: number; // Offset for the noise function to create variety
  oceanDepth?: number; // How deep oceans are between continents (0-1)
}

// Default continental falloff settings
export const DEFAULT_CONTINENTAL_ENABLED = true;
export const DEFAULT_CONTINENTAL_SHARPNESS = 10.0;
export const DEFAULT_CONTINENTAL_SCALE = 200;
export const DEFAULT_CONTINENTAL_THRESHOLD = 0.49;
export const DEFAULT_CONTINENTAL_STRENGTH = 1.0;
export const DEFAULT_CONTINENTAL_NOISE_OFFSET = 5000;
export const DEFAULT_CONTINENTAL_OCEAN_DEPTH = 0.6;

// Combined continental falloff parameters
export const DEFAULT_CONTINENTAL_PARAMS: ContinentalFalloffParams = {
  enabled: DEFAULT_CONTINENTAL_ENABLED,
  sharpness: DEFAULT_CONTINENTAL_SHARPNESS,
  scale: DEFAULT_CONTINENTAL_SCALE,
  threshold: DEFAULT_CONTINENTAL_THRESHOLD,
  strength: DEFAULT_CONTINENTAL_STRENGTH,
  noiseOffset: DEFAULT_CONTINENTAL_NOISE_OFFSET,
  oceanDepth: DEFAULT_CONTINENTAL_OCEAN_DEPTH,
};

// Camera and zoom settings
export const INITIAL_ZOOM = 0.09; // Starting zoom level (1.0 = 100%)
export const MIN_ZOOM = 0.01; // Minimum zoom allowed (10%)
export const MAX_ZOOM = 5.0; // Maximum zoom allowed (500%)
export const CAMERA_SPEED = 10; // Speed for camera movement
export const INITIAL_OFFSET_X = WORLD_GRID_WIDTH / 2; // Initial camera position (center of world)
export const INITIAL_OFFSET_Y = WORLD_GRID_HEIGHT / 2; // Initial camera position (center of world)

// Performance settings
export const LOW_ZOOM_THRESHOLD = 0.5; // Threshold for low zoom performance optimizations
export const LOW_ZOOM_TILE_FACTOR = 4; // Factor to reduce tile count when zoomed out

// Biome identifiers - expanded biome system
export enum BiomeType {
  // Water biomes
  OCEAN_DEEP = 0,
  OCEAN_MEDIUM = 1,
  OCEAN_SHALLOW = 2,

  // Beach/shore biomes
  BEACH = 3,
  ROCKY_SHORE = 4,

  // Dry lowlands
  SUBTROPICAL_DESERT = 5,
  TEMPERATE_DESERT = 6,

  // Humid lowlands
  TROPICAL_RAINFOREST = 7,
  TROPICAL_SEASONAL_FOREST = 8,
  GRASSLAND = 9,

  // Medium elevation
  TEMPERATE_DECIDUOUS_FOREST = 10,
  TEMPERATE_GRASSLAND = 11,
  SHRUBLAND = 12,

  // High elevation areas
  TAIGA = 13,
  TUNDRA = 14,

  // Very high elevation areas
  BARE = 15,
  SCORCHED = 16,
  SNOW = 17,
}

// Biome weight presets - These determine the relative distribution of biome types
// Higher weight means more of that biome type will appear in the world
// Note: These weights primarily affect elevation distribution, which in turn affects biome distribution
export const BIOME_PRESETS = {
  // WORLD preset - Realistic Earth-like world with few large continents surrounded by large oceans
  WORLD: {
    weights: [80, 10, 10, 5, 35, 25, 20],
    elevationScale: 180,
    moistureScale: 200,
    elevationOctaves: 7,
    moistureOctaves: 6,
    elevationPersistence: 0.45,
    moisturePersistence: 0.5,
    temperatureParams: {
      equatorPosition: 0.5,
      temperatureVariance: 0.1,
      elevationEffect: 0.3,
      bandScale: 1.0,
    },
    radialGradientParams: {
      centerX: 0.5,
      centerY: 0.5,
      radius: 0.6,
      falloffExponent: 2.5,
      strength: 0.7,
    },
  },

  // CONTINENTS preset - Mostly land with large continents and less water
  CONTINENTS: {
    weights: [20, 10, 10, 5, 50, 40, 30],
    elevationScale: 220,
    moistureScale: 180,
    elevationOctaves: 5,
    moistureOctaves: 4,
    elevationPersistence: 0.5,
    moisturePersistence: 0.6,
    temperatureParams: {
      equatorPosition: 0.5,
      temperatureVariance: 0.15,
      elevationEffect: 0.25,
      bandScale: 0.85,
    },
    radialGradientParams: {
      centerX: 0.5,
      centerY: 0.5,
      radius: 0.7,
      falloffExponent: 3,
      strength: 0.5,
    },
  },

  // ISLANDS preset - Many small islands scattered across ocean
  ISLANDS: {
    weights: [65, 15, 10, 5, 20, 15, 10],
    elevationScale: 120,
    moistureScale: 150,
    elevationOctaves: 8,
    moistureOctaves: 5,
    elevationPersistence: 0.35,
    moisturePersistence: 0.4,
    temperatureParams: {
      equatorPosition: 0.55,
      temperatureVariance: 0.08,
      elevationEffect: 0.35,
      bandScale: 1.1,
    },
    radialGradientParams: {
      centerX: 0.5,
      centerY: 0.5,
      radius: 0.5,
      falloffExponent: 2,
      strength: 0.6,
    },
  },

  // Custom preset - User defined, initially same as CONTINENTS
  CUSTOM: {
    weights: [20, 10, 10, 5, 50, 40, 30],
    elevationScale: 200,
    moistureScale: 200,
    elevationOctaves: 6,
    moistureOctaves: 5,
    elevationPersistence: 0.5,
    moisturePersistence: 0.5,
    temperatureParams: {
      equatorPosition: 0.5,
      temperatureVariance: 0.15,
      elevationEffect: 0.25,
      bandScale: 1.0,
    },
    radialGradientParams: {
      centerX: 0.5,
      centerY: 0.5,
      radius: 0.6,
      falloffExponent: 3,
      strength: 0.6,
    },
  },
};

// Biome height thresholds (noise values) - these will be dynamically calculated from weights
// These are default fallback values for elevation bands
export const BIOME_HEIGHTS = {
  [BiomeType.OCEAN_DEEP]: { min: 0.0, max: 0.35 },
  [BiomeType.OCEAN_MEDIUM]: { min: 0.35, max: 0.4 },
  [BiomeType.OCEAN_SHALLOW]: { min: 0.4, max: 0.45 },
  [BiomeType.BEACH]: { min: 0.45, max: 0.5 },
  [BiomeType.ROCKY_SHORE]: { min: 0.45, max: 0.5 },
  [BiomeType.SUBTROPICAL_DESERT]: { min: 0.5, max: 0.55 },
  [BiomeType.TEMPERATE_DESERT]: { min: 0.5, max: 0.55 },
  [BiomeType.TROPICAL_RAINFOREST]: { min: 0.5, max: 0.6 },
  [BiomeType.TROPICAL_SEASONAL_FOREST]: { min: 0.5, max: 0.6 },
  [BiomeType.GRASSLAND]: { min: 0.5, max: 0.6 },
  [BiomeType.TEMPERATE_DECIDUOUS_FOREST]: { min: 0.55, max: 0.65 },
  [BiomeType.TEMPERATE_GRASSLAND]: { min: 0.55, max: 0.65 },
  [BiomeType.SHRUBLAND]: { min: 0.55, max: 0.65 },
  [BiomeType.TAIGA]: { min: 0.6, max: 0.75 },
  [BiomeType.TUNDRA]: { min: 0.6, max: 0.75 },
  [BiomeType.BARE]: { min: 0.75, max: 0.85 },
  [BiomeType.SCORCHED]: { min: 0.85, max: 0.95 },
  [BiomeType.SNOW]: { min: 0.85, max: 1.0 },
};

// Default moisture thresholds - used for biome determination
export const MOISTURE_THRESHOLDS = {
  VERY_DRY: 0.15, // Reduced to create more desert/arid regions
  DRY: 0.35, // Adjusted for better transition
  MEDIUM: 0.5, // Slightly lower for more balanced distribution
  WET: 0.75, // Slightly lower for more balanced distribution
  VERY_WET: 1.0, // Maximum stays the same
};

// Temperature thresholds for biome determination
export const TEMPERATURE_THRESHOLDS = {
  FREEZING: 0.15,
  COLD: 0.3,
  COOL: 0.45,
  MILD: 0.6,
  WARM: 0.75,
  HOT: 0.9,
  SCORCHING: 1.0,
};

// Basic elevation bands organized by height - used for biome selection in biomeMapper.ts
export const ELEVATION_BANDS = {
  WATER_DEEP: 0.35,
  WATER_MEDIUM: 0.4,
  WATER_SHALLOW: 0.45,
  SHORE: 0.5,
  LOW: 0.6,
  MEDIUM: 0.7,
  HIGH: 0.85,
  VERY_HIGH: 0.95,
};

// Function to calculate height thresholds based on weights
// This is similar to the Python implementation in the reference code
export const calculateBiomeHeights = (
  weights: number[]
): typeof BIOME_HEIGHTS => {
  // Make a copy of the default heights
  const newHeights = { ...BIOME_HEIGHTS };

  // Calculate total weight sum
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  // Range from 0 to 1
  const totalRange = 1.0;

  // Define the basic water and land biomes to set heights for
  const basicBiomes = [
    BiomeType.OCEAN_DEEP,
    BiomeType.OCEAN_MEDIUM,
    BiomeType.OCEAN_SHALLOW,
    BiomeType.BEACH,
    BiomeType.GRASSLAND,
    BiomeType.BARE,
    BiomeType.SNOW,
  ];

  // Calculate maximum height for each basic biome based on weight values
  let previousHeight = 0.0;
  for (let i = 0; i < weights.length && i < basicBiomes.length; i++) {
    const biomeType = basicBiomes[i];
    const heightRange = totalRange * (weights[i] / totalWeight);

    newHeights[biomeType] = {
      min: previousHeight,
      max: previousHeight + heightRange,
    };

    previousHeight += heightRange;
  }

  // Ensure the last biome goes to 1.0
  if (weights.length > 0) {
    newHeights[
      basicBiomes[Math.min(weights.length, basicBiomes.length) - 1]
    ].max = 1.0;
  }

  // Update related biomes based on the calculated heights
  newHeights[BiomeType.ROCKY_SHORE] = { ...newHeights[BiomeType.BEACH] };
  newHeights[BiomeType.SUBTROPICAL_DESERT] = {
    min: newHeights[BiomeType.BEACH].max,
    max: newHeights[BiomeType.GRASSLAND].min + 0.05,
  };
  newHeights[BiomeType.TEMPERATE_DESERT] = {
    ...newHeights[BiomeType.SUBTROPICAL_DESERT],
  };
  newHeights[BiomeType.TROPICAL_RAINFOREST] = {
    min: newHeights[BiomeType.BEACH].max,
    max: newHeights[BiomeType.GRASSLAND].max,
  };
  newHeights[BiomeType.TROPICAL_SEASONAL_FOREST] = {
    ...newHeights[BiomeType.TROPICAL_RAINFOREST],
  };
  newHeights[BiomeType.TEMPERATE_DECIDUOUS_FOREST] = {
    min: newHeights[BiomeType.GRASSLAND].min,
    max: newHeights[BiomeType.GRASSLAND].max + 0.05,
  };
  newHeights[BiomeType.TEMPERATE_GRASSLAND] = {
    ...newHeights[BiomeType.TEMPERATE_DECIDUOUS_FOREST],
  };
  newHeights[BiomeType.SHRUBLAND] = {
    ...newHeights[BiomeType.TEMPERATE_DECIDUOUS_FOREST],
  };
  newHeights[BiomeType.TAIGA] = {
    min: newHeights[BiomeType.GRASSLAND].max,
    max: newHeights[BiomeType.BARE].min + 0.05,
  };
  newHeights[BiomeType.TUNDRA] = { ...newHeights[BiomeType.TAIGA] };
  newHeights[BiomeType.SCORCHED] = {
    min: newHeights[BiomeType.BARE].max,
    max: 1.0,
  };

  return newHeights;
};

// Extended biome colors
export const BIOME_COLORS = {
  // Water biomes
  [BiomeType.OCEAN_DEEP]: { r: 30, g: 120, b: 200 },
  [BiomeType.OCEAN_MEDIUM]: { r: 35, g: 140, b: 220 },
  [BiomeType.OCEAN_SHALLOW]: { r: 40, g: 160, b: 230 },

  // Beach/shore biomes
  [BiomeType.BEACH]: { r: 245, g: 236, b: 150 },
  [BiomeType.ROCKY_SHORE]: { r: 180, g: 180, b: 160 },

  // Dry lowlands
  [BiomeType.SUBTROPICAL_DESERT]: { r: 240, g: 215, b: 140 },
  [BiomeType.TEMPERATE_DESERT]: { r: 225, g: 195, b: 120 },

  // Humid lowlands
  [BiomeType.TROPICAL_RAINFOREST]: { r: 35, g: 195, b: 95 },
  [BiomeType.TROPICAL_SEASONAL_FOREST]: { r: 90, g: 185, b: 90 },
  [BiomeType.GRASSLAND]: { r: 145, g: 206, b: 80 },

  // Medium elevation
  [BiomeType.TEMPERATE_DECIDUOUS_FOREST]: { r: 75, g: 165, b: 80 },
  [BiomeType.TEMPERATE_GRASSLAND]: { r: 170, g: 200, b: 90 },
  [BiomeType.SHRUBLAND]: { r: 170, g: 180, b: 110 },

  // High elevation
  [BiomeType.TAIGA]: { r: 110, g: 160, b: 90 },
  [BiomeType.TUNDRA]: { r: 180, g: 180, b: 170 },

  // Very high elevation
  [BiomeType.BARE]: { r: 140, g: 140, b: 120 },
  [BiomeType.SCORCHED]: { r: 100, g: 100, b: 100 },
  [BiomeType.SNOW]: { r: 240, g: 240, b: 240 },
};

// List of basic biome types for weight distribution
export const BASIC_BIOME_TYPES = [
  BiomeType.OCEAN_DEEP,
  BiomeType.OCEAN_MEDIUM,
  BiomeType.OCEAN_SHALLOW,
  BiomeType.BEACH,
  BiomeType.GRASSLAND,
  BiomeType.BARE,
  BiomeType.SNOW,
];

// Biome type names for UI display
export const BIOME_NAMES = {
  [BiomeType.OCEAN_DEEP]: "Deep Ocean",
  [BiomeType.OCEAN_MEDIUM]: "Medium Ocean",
  [BiomeType.OCEAN_SHALLOW]: "Shallow Ocean",
  [BiomeType.BEACH]: "Sandy Beach",
  [BiomeType.ROCKY_SHORE]: "Rocky Shore",
  [BiomeType.SUBTROPICAL_DESERT]: "Subtropical Desert",
  [BiomeType.TEMPERATE_DESERT]: "Temperate Desert",
  [BiomeType.TROPICAL_RAINFOREST]: "Tropical Rainforest",
  [BiomeType.TROPICAL_SEASONAL_FOREST]: "Tropical Seasonal Forest",
  [BiomeType.GRASSLAND]: "Grassland",
  [BiomeType.TEMPERATE_DECIDUOUS_FOREST]: "Temperate Deciduous Forest",
  [BiomeType.TEMPERATE_GRASSLAND]: "Temperate Grassland",
  [BiomeType.SHRUBLAND]: "Shrubland",
  [BiomeType.TAIGA]: "Taiga",
  [BiomeType.TUNDRA]: "Tundra",
  [BiomeType.BARE]: "Bare Ground",
  [BiomeType.SCORCHED]: "Scorched Land",
  [BiomeType.SNOW]: "Snow",
};

// Visualization modes
export enum VisualizationMode {
  BIOME = "biome", // Normal colored biome view
  NOISE = "noise", // Raw Perlin noise values as grayscale
  ELEVATION = "elevation", // Elevation using a height gradient
  MOISTURE = "moisture", // Moisture using a blue gradient
  TEMPERATURE = "temperature", // Temperature using a temperature gradient
  WEIGHT_DISTRIBUTION = "weight", // Shows how weights affect terrain distribution
  RESOURCE = "resource", // Shows resources on the map
}

// Tile grid constants
export const GRID_WIDTH =
  (WINDOW_WIDTH + DEFAULT_TILE_SIZE - 1) / DEFAULT_TILE_SIZE;
export const GRID_HEIGHT =
  (WINDOW_HEIGHT + DEFAULT_TILE_SIZE - 1) / DEFAULT_TILE_SIZE;

// Grid visibility thresholds
export const GRID_VISIBLE_THRESHOLD = 0.6; // Show grid lines when zoom > 60%
export const COORDS_VISIBLE_THRESHOLD = 2.0; // Show tile coordinates when zoom > 200%

// Debug settings
export const DEBUG_MODE = true; // Enable or disable debug information
export const SHOW_GRID = true; // Show grid lines in debug mode
export const SHOW_COORDS = true; // Show coordinates in debug mode

// Function to collect all configuration parameters for exporting
export interface ExportedConfig {
  // Basic settings
  seed: number;
  tileSize: number;

  // Noise settings
  noiseDetail: number;
  noiseFalloff: number;
  elevationOctaves: number;
  moistureOctaves: number;
  elevationScale: number;
  moistureScale: number;
  elevationPersistence: number;
  moisturePersistence: number;

  // Temperature settings
  temperatureParams: TemperatureParams;

  // Radial gradient settings
  radialGradientParams: RadialGradientParams;

  // Biome weights
  biomeWeights: number[];

  // Thresholds
  moistureThresholds: typeof MOISTURE_THRESHOLDS;
  temperatureThresholds: typeof TEMPERATURE_THRESHOLDS;
}

/**
 * Create a configuration object with the current settings
 */
export function createConfigObject(
  params: Partial<ExportedConfig>
): ExportedConfig {
  return {
    // Basic settings with defaults
    seed: params.seed || DEFAULT_SEED,
    tileSize: params.tileSize || DEFAULT_TILE_SIZE,

    // Noise settings with defaults
    noiseDetail: params.noiseDetail || NOISE_DETAIL,
    noiseFalloff: params.noiseFalloff || NOISE_FALLOFF,
    elevationOctaves: params.elevationOctaves || DEFAULT_OCTAVES,
    moistureOctaves: params.moistureOctaves || DEFAULT_OCTAVES,
    elevationScale: params.elevationScale || DEFAULT_ELEVATION_SCALE,
    moistureScale: params.moistureScale || DEFAULT_MOISTURE_SCALE,
    elevationPersistence: params.elevationPersistence || DEFAULT_OCTAVE_WEIGHT,
    moisturePersistence: params.moisturePersistence || DEFAULT_OCTAVE_WEIGHT,

    // Temperature settings with defaults
    temperatureParams: {
      ...DEFAULT_TEMPERATURE_PARAMS,
      ...(params.temperatureParams || {}),
    },

    // Radial gradient settings with defaults
    radialGradientParams: {
      ...DEFAULT_RADIAL_PARAMS,
      ...(params.radialGradientParams || {}),
    },

    // Biome weights with defaults
    biomeWeights: params.biomeWeights || BIOME_PRESETS.WORLD.weights,

    // Thresholds with defaults
    moistureThresholds: params.moistureThresholds || MOISTURE_THRESHOLDS,
    temperatureThresholds:
      params.temperatureThresholds || TEMPERATURE_THRESHOLDS,
  };
}

/**
 * Export configuration as a downloadable JSON file
 */
export function exportConfigAsFile(config: ExportedConfig): void {
  // Create a JSON string with pretty formatting
  const configJson = JSON.stringify(config, null, 2);

  // Create a blob from the JSON
  const blob = new Blob([configJson], { type: "application/json" });

  // Create a download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `world-config-${config.seed}.json`;

  // Append to document, click to download, then remove
  document.body.appendChild(link);
  link.click();

  // Clean up
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}
