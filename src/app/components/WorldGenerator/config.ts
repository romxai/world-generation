// Configuration for the procedurally generated world

// Window dimensions
export const WINDOW_WIDTH = 1080;
export const WINDOW_HEIGHT = 720;
export const DEFAULT_TILE_SIZE = 16; // Base tile size in pixels

// World dimensions
export const WORLD_GRID_WIDTH = 1000; // Fixed number of tiles in the world (x-axis)
export const WORLD_GRID_HEIGHT = 1000; // Fixed number of tiles in the world (y-axis)

// Noise configuration
export const DEFAULT_SEED = 42; // Default seed for reproducible generation
export const NOISE_DETAIL = 9; // Detail level for noise generation
export const NOISE_FALLOFF = 0.2; // Falloff rate for noise
export const INITIAL_ZOOM = 1.0; // Starting zoom level (1.0 = 100%)
export const MIN_ZOOM = 0.1; // Minimum zoom allowed (10%)
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

// Biome weight presets - These determine the relative distribution of terrain types
// Higher weight means more of that terrain type will appear in the world
export const BIOME_PRESETS = {
  // Islands preset - Mostly ocean with some small islands
  ISLANDS: [70, 20, 20, 12, 35, 30, 0], // Matches WEIGHTS1 from Python reference
  // Continents preset - More balanced with larger landmasses
  CONTINENTS: [35, 20, 20, 15, 30, 30, 25], // Matches WEIGHTS2 from Python reference
  // Lakes preset - Mostly land with some lakes/ocean areas
  LAKES: [20, 15, 15, 15, 50, 35, 45], // Matches WEIGHTS3 from Python reference
  // Custom preset - User defined
  CUSTOM: [35, 20, 20, 15, 30, 30, 25],
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

// Visualization modes for the map
export enum VisualizationMode {
  BIOME = "biome", // Normal colored biome view
  NOISE = "noise", // Raw Perlin noise values as grayscale
  ELEVATION = "elevation", // Elevation using a height gradient
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
