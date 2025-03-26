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

// Debug settings
export const DEBUG_MODE = true; // Enable or disable debug information

// Resource types
export enum ResourceType {
  IRON = "iron",
  COPPER = "copper",
  COAL = "coal",
  GOLD = "gold",
  SILVER = "silver",
  OIL = "oil",
  GAS = "gas",
  DIAMOND = "diamond",
}

// Resource configuration
export interface ResourceConfig {
  name: string;
  color: RGB;
  baseDensity: number;
  noiseScale: number;
  noiseOctaves: number;
  noisePersistence: number;
  elevationRange: [number, number]; // [min, max]
  moistureRange: [number, number]; // [min, max]
  temperatureRange: [number, number]; // [min, max]
  biomeTypes?: BiomeType[]; // Biomes where this resource can appear
}

// Default resource configurations
export const DEFAULT_RESOURCE_CONFIGS: Record<ResourceType, ResourceConfig> = {
  [ResourceType.IRON]: {
    name: "Iron",
    color: { r: 120, g: 120, b: 120 },
    baseDensity: 0.15,
    noiseScale: 150,
    noiseOctaves: 3,
    noisePersistence: 0.5,
    elevationRange: [0.3, 0.8],
    moistureRange: [0.0, 0.7],
    temperatureRange: [0.1, 0.9],
    biomeTypes: [
      BiomeType.BARE,
      BiomeType.SCORCHED,
      BiomeType.TAIGA,
      BiomeType.TEMPERATE_DECIDUOUS_FOREST,
      BiomeType.TEMPERATE_DESERT,
      BiomeType.TEMPERATE_GRASSLAND,
      BiomeType.SHRUBLAND,
    ],
  },
  [ResourceType.COPPER]: {
    name: "Copper",
    color: { r: 184, g: 115, b: 51 },
    baseDensity: 0.12,
    noiseScale: 180,
    noiseOctaves: 2,
    noisePersistence: 0.45,
    elevationRange: [0.35, 0.8],
    moistureRange: [0.2, 0.8],
    temperatureRange: [0.2, 0.9],
    biomeTypes: [
      BiomeType.BARE,
      BiomeType.SCORCHED,
      BiomeType.TAIGA,
      BiomeType.SHRUBLAND,
      BiomeType.TEMPERATE_DECIDUOUS_FOREST,
    ],
  },
  [ResourceType.COAL]: {
    name: "Coal",
    color: { r: 40, g: 40, b: 40 },
    baseDensity: 0.2,
    noiseScale: 120,
    noiseOctaves: 3,
    noisePersistence: 0.5,
    elevationRange: [0.3, 0.7],
    moistureRange: [0.3, 0.9],
    temperatureRange: [0.3, 0.8],
    biomeTypes: [
      BiomeType.TAIGA,
      BiomeType.TEMPERATE_DECIDUOUS_FOREST,
      BiomeType.TEMPERATE_GRASSLAND,
      BiomeType.SHRUBLAND,
    ],
  },
  [ResourceType.GOLD]: {
    name: "Gold",
    color: { r: 255, g: 215, b: 0 },
    baseDensity: 0.07,
    noiseScale: 220,
    noiseOctaves: 3,
    noisePersistence: 0.4,
    elevationRange: [0.4, 0.9],
    moistureRange: [0.0, 0.5],
    temperatureRange: [0.4, 0.9],
    biomeTypes: [
      BiomeType.SUBTROPICAL_DESERT,
      BiomeType.TEMPERATE_DESERT,
      BiomeType.SCORCHED,
      BiomeType.SHRUBLAND,
    ],
  },
  [ResourceType.SILVER]: {
    name: "Silver",
    color: { r: 192, g: 192, b: 192 },
    baseDensity: 0.08,
    noiseScale: 200,
    noiseOctaves: 3,
    noisePersistence: 0.4,
    elevationRange: [0.4, 0.85],
    moistureRange: [0.0, 0.4],
    temperatureRange: [0.2, 0.7],
    biomeTypes: [
      BiomeType.TEMPERATE_DESERT,
      BiomeType.BARE,
      BiomeType.SCORCHED,
    ],
  },
  [ResourceType.OIL]: {
    name: "Oil",
    color: { r: 50, g: 50, b: 50 },
    baseDensity: 0.13,
    noiseScale: 250,
    noiseOctaves: 2,
    noisePersistence: 0.6,
    elevationRange: [0.1, 0.4],
    moistureRange: [0.2, 0.8],
    temperatureRange: [0.4, 0.9],
    biomeTypes: [
      BiomeType.SUBTROPICAL_DESERT,
      BiomeType.TEMPERATE_DESERT,
      BiomeType.GRASSLAND,
      BiomeType.TEMPERATE_GRASSLAND,
      BiomeType.OCEAN_SHALLOW,
    ],
  },
  [ResourceType.GAS]: {
    name: "Natural Gas",
    color: { r: 220, g: 220, b: 255 },
    baseDensity: 0.1,
    noiseScale: 280,
    noiseOctaves: 2,
    noisePersistence: 0.55,
    elevationRange: [0.1, 0.5],
    moistureRange: [0.4, 0.9],
    temperatureRange: [0.3, 0.7],
    biomeTypes: [
      BiomeType.GRASSLAND,
      BiomeType.TEMPERATE_GRASSLAND,
      BiomeType.SHRUBLAND,
      BiomeType.OCEAN_SHALLOW,
      BiomeType.OCEAN_MEDIUM,
    ],
  },
  [ResourceType.DIAMOND]: {
    name: "Diamond",
    color: { r: 185, g: 242, b: 255 },
    baseDensity: 0.03,
    noiseScale: 350,
    noiseOctaves: 4,
    noisePersistence: 0.3,
    elevationRange: [0.6, 0.9],
    moistureRange: [0.0, 0.3],
    temperatureRange: [0.2, 0.6],
    biomeTypes: [BiomeType.SCORCHED, BiomeType.BARE],
  },
};

// Visualization modes for the map
export enum VisualizationMode {
  BIOME = "biome", // Normal colored biome view
  NOISE = "noise", // Raw Perlin noise values as grayscale
  ELEVATION = "elevation", // Elevation using a height gradient
  MOISTURE = "moisture", // Moisture using a blue gradient
  TEMPERATURE = "temperature", // Temperature using a temperature gradient
  RESOURCES = "resources", // Resource distribution visualization
}

// Tile grid constants
export const GRID_WIDTH =
  (WINDOW_WIDTH + DEFAULT_TILE_SIZE - 1) / DEFAULT_TILE_SIZE;
export const GRID_HEIGHT =
  (WINDOW_HEIGHT + DEFAULT_TILE_SIZE - 1) / DEFAULT_TILE_SIZE;

// Grid visibility thresholds
export const GRID_VISIBLE_THRESHOLD = 0.6; // Show grid lines when zoom > 60%
export const COORDS_VISIBLE_THRESHOLD = 2.0; // Show tile coordinates when zoom > 200%

// Show grid lines in debug mode
export const SHOW_GRID = true;

// Show coordinates in debug mode
export const SHOW_COORDS = true;

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

  // Thresholds
  moistureThresholds: typeof MOISTURE_THRESHOLDS;
  temperatureThresholds: typeof TEMPERATURE_THRESHOLDS;

  // Resource settings
  resourceConfigs?: Record<ResourceType, ResourceConfig>;
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

    // Thresholds with defaults
    moistureThresholds: params.moistureThresholds || MOISTURE_THRESHOLDS,
    temperatureThresholds:
      params.temperatureThresholds || TEMPERATURE_THRESHOLDS,

    // Resource settings
    resourceConfigs: params.resourceConfigs || DEFAULT_RESOURCE_CONFIGS,
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
