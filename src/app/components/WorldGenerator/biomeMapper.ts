/**
 * biomeMapper.ts
 *
 * This module contains functionality for mapping elevation, moisture, and temperature values
 * to specific biomes, creating a realistic world with diverse terrain types.
 * Loosely based on the Whittaker diagram which classifies biomes based on
 * temperature and precipitation (moisture).
 */

import {
  BiomeType,
  BIOME_COLORS,
  MOISTURE_THRESHOLDS,
  RGB,
  TEMPERATURE_THRESHOLDS,
} from "./config";

/**
 * Range of values defining elevation bands
 */
export const ELEVATION_BANDS = {
  WATER_DEEP: 0.45, // Deep ocean - increased to create more deep ocean
  WATER_MEDIUM: 0.48, // Medium depth water
  WATER_SHALLOW: 0.5, // Shallow water - increased to create more defined shorelines
  SHORE: 0.51, // Beach/shore zone - narrow transition band
  LOW: 0.55, // Low elevation areas (plains, deserts, etc.)
  MEDIUM: 0.7, // Medium elevation (hills, forests)
  HIGH: 0.82, // High elevation (mountains)
  VERY_HIGH: 0.9, // Very high elevation (peaks)
};

/**
 * Interface to store elevation, moisture, and temperature data
 */
export interface BiomeData {
  elevation: number;
  moisture: number;
  temperature: number;
  x: number;
  y: number;
  moistureThresholds?: any; // Using 'any' temporarily
  temperatureThresholds?: any; // Using 'any' temporarily
}

/**
 * Get the color for a given biome
 */
export function getBiomeColor(biome: BiomeType): RGB {
  return BIOME_COLORS[biome];
}

/**
 * Determine the biome type based on elevation, moisture, and temperature values
 * This uses a modified Whittaker biome classification approach
 *
 * @param data Object containing elevation, moisture, and temperature values
 * @returns The appropriate biome type for this location
 */
export function getBiomeType(data: BiomeData): BiomeType {
  const { elevation, moisture, temperature } = data;

  // Use custom thresholds if provided, otherwise use defaults
  const moistureThresholds = data.moistureThresholds || MOISTURE_THRESHOLDS;
  const temperatureThresholds =
    data.temperatureThresholds || TEMPERATURE_THRESHOLDS;

  // Deep water biomes - only affected by elevation, not moisture or temperature
  if (elevation < ELEVATION_BANDS.WATER_DEEP) {
    return BiomeType.OCEAN_DEEP;
  }

  // Medium water biomes
  if (elevation < ELEVATION_BANDS.WATER_MEDIUM) {
    return BiomeType.OCEAN_MEDIUM;
  }

  // Shallow water biomes
  if (elevation < ELEVATION_BANDS.WATER_SHALLOW) {
    return BiomeType.OCEAN_SHALLOW;
  }

  // Shore biomes - affected by temperature and moisture
  if (elevation < ELEVATION_BANDS.SHORE) {
    // Rocky shores more common in colder areas or areas with high moisture
    // Sandy beaches in warmer and drier areas
    if (
      temperature < temperatureThresholds.MILD ||
      moisture > moistureThresholds.WET
    ) {
      return BiomeType.ROCKY_SHORE;
    } else {
      return BiomeType.BEACH;
    }
  }

  // Low elevation biomes - highly affected by moisture and temperature
  if (elevation < ELEVATION_BANDS.LOW) {
    // Very cold regions - Tundra regardless of moisture
    if (temperature < temperatureThresholds.FREEZING) {
      return BiomeType.TUNDRA;
    }

    // Cold regions - Taiga for wet areas, Tundra for dry
    if (temperature < temperatureThresholds.COLD) {
      return moisture < moistureThresholds.MEDIUM
        ? BiomeType.TUNDRA
        : BiomeType.TAIGA;
    }

    // Cool regions
    if (temperature < temperatureThresholds.COOL) {
      if (moisture < moistureThresholds.DRY) {
        return BiomeType.TEMPERATE_DESERT;
      } else if (moisture < moistureThresholds.WET) {
        return BiomeType.SHRUBLAND; // Reduced band
      } else {
        return BiomeType.TAIGA; // Reduced band
      }
    }

    // Mild regions
    if (temperature < temperatureThresholds.WARM) {
      if (moisture < moistureThresholds.DRY) {
        return BiomeType.TEMPERATE_DESERT;
      } else if (moisture < moistureThresholds.MEDIUM) {
        return BiomeType.GRASSLAND;
      } else if (moisture < moistureThresholds.WET) {
        return BiomeType.TEMPERATE_DECIDUOUS_FOREST;
      } else {
        return BiomeType.TEMPERATE_GRASSLAND;
      }
    }

    // Hot regions
    if (temperature > temperatureThresholds.WARM) {
      // From dry to wet: desert -> seasonal forest -> rainforest
      if (moisture < moistureThresholds.DRY) {
        return BiomeType.SUBTROPICAL_DESERT;
      } else if (moisture < moistureThresholds.WET) {
        return BiomeType.TROPICAL_SEASONAL_FOREST;
      } else {
        return BiomeType.TROPICAL_RAINFOREST;
      }
    }
  }

  // Medium elevation biomes - affected by temperature and moisture but less variety
  if (elevation < ELEVATION_BANDS.HIGH) {
    // Temperature primarily affects vegetation type
    if (temperature < temperatureThresholds.FREEZING) {
      return BiomeType.TUNDRA; // Updated to tundra for the coldest regions
    } else if (temperature < temperatureThresholds.COLD) {
      return moisture < moistureThresholds.MEDIUM
        ? BiomeType.TUNDRA // Expanded tundra in cold dry regions
        : BiomeType.TAIGA; // Reduced taiga band
    } else if (temperature < temperatureThresholds.MILD) {
      if (moisture < moistureThresholds.MEDIUM) {
        return BiomeType.SHRUBLAND; // Reduced shrubland band
      } else {
        return BiomeType.TEMPERATE_DECIDUOUS_FOREST;
      }
    } else {
      if (moisture < moistureThresholds.MEDIUM) {
        return BiomeType.SUBTROPICAL_DESERT;
      } else if (moisture < moistureThresholds.WET) {
        return BiomeType.TROPICAL_SEASONAL_FOREST;
      } else {
        return BiomeType.TROPICAL_RAINFOREST;
      }
    }
  }

  // High elevation biomes - mostly affected by temperature
  if (elevation < ELEVATION_BANDS.VERY_HIGH) {
    if (temperature < temperatureThresholds.FREEZING) {
      return BiomeType.SNOW;
    } else if (temperature < temperatureThresholds.COLD) {
      return BiomeType.TUNDRA; // Increased tundra presence
    } else if (temperature < temperatureThresholds.MILD) {
      return moisture < moistureThresholds.MEDIUM
        ? BiomeType.BARE
        : BiomeType.TAIGA;
    } else {
      return BiomeType.BARE;
    }
  }

  // Very high elevation - mountain peaks, etc.
  if (temperature < temperatureThresholds.COOL) {
    return BiomeType.SNOW;
  } else if (temperature < temperatureThresholds.MILD) {
    return BiomeType.BARE;
  } else {
    return BiomeType.SCORCHED;
  }
}

/**
 * Get a color representing moisture level for visualization
 */
export function getMoistureColor(value: number): RGB {
  // Blue gradient from dark (dry) to bright (wet)
  return {
    r: 0,
    g: Math.floor(150 * value),
    b: Math.floor(100 + 155 * value),
  };
}

/**
 * Get a color representing elevation for visualization
 */
export function getElevationColor(value: number): RGB {
  // Gradient from deep blue (low) to white (high)
  if (value < 0.5) {
    // Water: Deep blue to light blue
    const normalizedValue = value / 0.5;
    return {
      r: Math.floor(normalizedValue * 150),
      g: Math.floor(100 + normalizedValue * 155),
      b: 255,
    };
  } else {
    // Land: Green to brown to white
    const normalizedValue = (value - 0.5) / 0.5;
    if (normalizedValue < 0.5) {
      // Green to brown
      const t = normalizedValue / 0.5;
      return {
        r: Math.floor(100 + t * 155),
        g: Math.floor(255 - t * 100),
        b: Math.floor(100 - t * 100),
      };
    } else {
      // Brown to white
      const t = (normalizedValue - 0.5) / 0.5;
      return {
        r: Math.floor(255 - t * 50 + t * 50),
        g: Math.floor(155 + t * 100),
        b: Math.floor(t * 255),
      };
    }
  }
}
