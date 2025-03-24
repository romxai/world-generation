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

// Temperature & climate settings
export const DEFAULT_EQUATOR_POSITION = 0.5; // Where the equator is located (0-1)
export const DEFAULT_TEMPERATURE_VARIANCE = 0.2; // Random variation in temperature
export const DEFAULT_ELEVATION_TEMP_EFFECT = 0.2; // How much elevation cools temperature
export const DEFAULT_TEMPERATURE_BAND_SCALE = 1.0; // Scale factor for temperature bands (1.0 = normal)

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

// Terrain type identifiers
export enum TerrainType {
  OCEAN_DEEP = 0,
  OCEAN_MEDIUM = 1,
  OCEAN_SHALLOW = 2,
  BEACH = 3,
  GRASS = 4,
  MOUNTAIN = 5,
  SNOW = 6,
}

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

// Biome weight presets - These determine the relative distribution of terrain types
// Higher weight means more of that terrain type will appear in the world
export const BIOME_PRESETS = {
  // WORLD preset - Realistic Earth-like world with few large continents surrounded by large oceans
  WORLD: [80, 10, 10, 5, 35, 25, 20],

  // CONTINENTS preset - Mostly land with large continents and less water
  CONTINENTS: [20, 10, 10, 5, 50, 40, 30],

  // ISLANDS preset - Many small islands scattered across ocean
  ISLANDS: [65, 15, 10, 5, 20, 15, 10],

  // Custom preset - User defined, initially same as CONTINENTS
  CUSTOM: [20, 10, 10, 5, 50, 40, 30],
};

// Terrain height thresholds (noise values) - these will be dynamically calculated from weights
// These are default fallback values if weight-based calculation is not used
export const TERRAIN_HEIGHTS = {
  [TerrainType.OCEAN_DEEP]: { min: 0.0, max: 0.35 },
  [TerrainType.OCEAN_MEDIUM]: { min: 0.35, max: 0.4 },
  [TerrainType.OCEAN_SHALLOW]: { min: 0.4, max: 0.45 },
  [TerrainType.BEACH]: { min: 0.45, max: 0.5 },
  [TerrainType.GRASS]: { min: 0.5, max: 0.65 },
  [TerrainType.MOUNTAIN]: { min: 0.65, max: 0.75 },
  [TerrainType.SNOW]: { min: 0.75, max: 1.0 },
};

// Default moisture thresholds - used for biome determination
export const MOISTURE_THRESHOLDS = {
  VERY_DRY: 0.15, // Reduced to create more desert/arid regions
  DRY: 0.35, // Adjusted for better transition
  MEDIUM: 0.55, // Slightly lower for more balanced distribution
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

// Function to calculate height thresholds based on weights
// This is similar to the Python implementation in the reference code
export const calculateTerrainHeights = (
  weights: number[]
): typeof TERRAIN_HEIGHTS => {
  // Make a copy of the default heights
  const newHeights = { ...TERRAIN_HEIGHTS };

  // Calculate total weight sum
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  // Range from 0 to 1
  const totalRange = 1.0;

  // Calculate maximum height for each terrain type based on weight values
  let previousHeight = 0.0;
  for (let i = 0; i < weights.length; i++) {
    const terrainType = i as TerrainType;
    const heightRange = totalRange * (weights[i] / totalWeight);

    newHeights[terrainType] = {
      min: previousHeight,
      max: previousHeight + heightRange,
    };

    previousHeight += heightRange;
  }

  // Ensure the last terrain type goes to 1.0
  if (weights.length > 0) {
    newHeights[(weights.length - 1) as TerrainType].max = 1.0;
  }

  return newHeights;
};

// Terrain colors (min and max for gradient effect)
export const TERRAIN_COLORS = {
  [TerrainType.OCEAN_DEEP]: {
    min: { r: 30, g: 120, b: 200 },
    max: { r: 40, g: 176, b: 251 },
    lerpAdjustment: 0,
  },
  [TerrainType.OCEAN_MEDIUM]: {
    min: { r: 35, g: 140, b: 220 },
    max: { r: 40, g: 200, b: 255 },
    lerpAdjustment: 0,
  },
  [TerrainType.OCEAN_SHALLOW]: {
    min: { r: 40, g: 160, b: 230 },
    max: { r: 40, g: 255, b: 255 },
    lerpAdjustment: 0,
  },
  [TerrainType.BEACH]: {
    min: { r: 215, g: 192, b: 158 },
    max: { r: 255, g: 246, b: 193 },
    lerpAdjustment: 0.3,
  },
  [TerrainType.GRASS]: {
    min: { r: 2, g: 166, b: 155 },
    max: { r: 118, g: 239, b: 124 },
    lerpAdjustment: 0,
  },
  [TerrainType.MOUNTAIN]: {
    min: { r: 90, g: 90, b: 90 },
    max: { r: 120, g: 120, b: 120 },
    lerpAdjustment: 0,
  },
  [TerrainType.SNOW]: {
    min: { r: 220, g: 220, b: 220 },
    max: { r: 255, g: 255, b: 255 },
    lerpAdjustment: -0.5,
  },
};

// Extended biome colors for the new biome system
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
  [BiomeType.TROPICAL_RAINFOREST]: { r: 40, g: 195, b: 50 },
  [BiomeType.TROPICAL_SEASONAL_FOREST]: { r: 70, g: 195, b: 90 },
  [BiomeType.GRASSLAND]: { r: 160, g: 220, b: 110 },

  // Medium elevation
  [BiomeType.TEMPERATE_DECIDUOUS_FOREST]: { r: 50, g: 140, b: 60 },
  [BiomeType.TEMPERATE_GRASSLAND]: { r: 130, g: 196, b: 90 },
  [BiomeType.SHRUBLAND]: { r: 160, g: 180, b: 120 },

  // High elevation areas
  [BiomeType.TAIGA]: { r: 120, g: 155, b: 135 },
  [BiomeType.TUNDRA]: { r: 205, g: 235, b: 240 }, // New whitish-blue color for tundra

  // Very high elevation areas
  [BiomeType.BARE]: { r: 140, g: 135, b: 130 },
  [BiomeType.SCORCHED]: { r: 95, g: 90, b: 85 },
  [BiomeType.SNOW]: { r: 240, g: 240, b: 240 },
};

// List of terrain types in order of height
export const ALL_TERRAIN_TYPES = [
  TerrainType.OCEAN_DEEP,
  TerrainType.OCEAN_MEDIUM,
  TerrainType.OCEAN_SHALLOW,
  TerrainType.BEACH,
  TerrainType.GRASS,
  TerrainType.MOUNTAIN,
  TerrainType.SNOW,
];

// Terrain type names for UI display
export const TERRAIN_NAMES = {
  [TerrainType.OCEAN_DEEP]: "Deep Ocean",
  [TerrainType.OCEAN_MEDIUM]: "Medium Ocean",
  [TerrainType.OCEAN_SHALLOW]: "Shallow Ocean",
  [TerrainType.BEACH]: "Beach",
  [TerrainType.GRASS]: "Grassland",
  [TerrainType.MOUNTAIN]: "Mountains",
  [TerrainType.SNOW]: "Snow",
};

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
  [BiomeType.TEMPERATE_DECIDUOUS_FOREST]: "Deciduous Forest",
  [BiomeType.TEMPERATE_GRASSLAND]: "Temperate Grassland",
  [BiomeType.SHRUBLAND]: "Shrubland",
  [BiomeType.TAIGA]: "Taiga",
  [BiomeType.TUNDRA]: "Tundra",
  [BiomeType.BARE]: "Bare",
  [BiomeType.SCORCHED]: "Scorched",
  [BiomeType.SNOW]: "Snow",
};

// Visualization modes for the map
export enum VisualizationMode {
  BIOME = "biome", // Normal colored biome view
  NOISE = "noise", // Raw Perlin noise values as grayscale
  ELEVATION = "elevation", // Elevation using a height gradient
  MOISTURE = "moisture", // Moisture using a blue gradient
  TEMPERATURE = "temperature", // Temperature using a temperature gradient
  WEIGHT_DISTRIBUTION = "weight", // Shows how weights affect terrain distribution
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
