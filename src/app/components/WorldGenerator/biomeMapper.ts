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
  WATER_DEEP: 0.2,
  WATER_MEDIUM: 0.3,
  WATER_SHALLOW: 0.4,
  SHORE: 0.45,
  LOW: 0.55,
  MEDIUM: 0.65,
  HIGH: 0.8,
  VERY_HIGH: 0.9,
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
    // Rocky shores more common in colder areas, sandy beaches in warmer areas
    return temperature < TEMPERATURE_THRESHOLDS.MILD ||
      moisture > MOISTURE_THRESHOLDS.WET
      ? BiomeType.ROCKY_SHORE
      : BiomeType.BEACH;
  }

  // Low elevation biomes - highly affected by moisture and temperature
  if (elevation < ELEVATION_BANDS.LOW) {
    if (temperature > TEMPERATURE_THRESHOLDS.WARM) {
      // Hot areas
      if (moisture < MOISTURE_THRESHOLDS.DRY) {
        return BiomeType.SUBTROPICAL_DESERT;
      } else if (moisture < MOISTURE_THRESHOLDS.WET) {
        return BiomeType.TROPICAL_SEASONAL_FOREST;
      } else {
        return BiomeType.TROPICAL_RAINFOREST;
      }
    } else if (temperature > TEMPERATURE_THRESHOLDS.COOL) {
      // Mild areas
      if (moisture < MOISTURE_THRESHOLDS.DRY) {
        return BiomeType.TEMPERATE_DESERT;
      } else if (moisture < MOISTURE_THRESHOLDS.WET) {
        return BiomeType.GRASSLAND;
      } else {
        return BiomeType.TEMPERATE_DECIDUOUS_FOREST;
      }
    } else {
      // Cool/cold areas
      if (moisture < MOISTURE_THRESHOLDS.MEDIUM) {
        return BiomeType.SHRUBLAND;
      } else if (moisture < MOISTURE_THRESHOLDS.WET) {
        return BiomeType.TAIGA;
      } else {
        return BiomeType.TUNDRA;
      }
    }
  }

  // Medium elevation biomes
  if (elevation < ELEVATION_BANDS.MEDIUM) {
    if (temperature > TEMPERATURE_THRESHOLDS.MILD) {
      // Warmer areas
      if (moisture < MOISTURE_THRESHOLDS.MEDIUM) {
        return BiomeType.TEMPERATE_DESERT;
      } else {
        return BiomeType.TEMPERATE_GRASSLAND;
      }
    } else {
      // Cooler areas
      if (moisture < MOISTURE_THRESHOLDS.MEDIUM) {
        return BiomeType.SHRUBLAND;
      } else if (moisture < MOISTURE_THRESHOLDS.WET) {
        return BiomeType.TAIGA;
      } else {
        return temperature < TEMPERATURE_THRESHOLDS.COLD
          ? BiomeType.TUNDRA
          : BiomeType.TEMPERATE_DECIDUOUS_FOREST;
      }
    }
  }

  // High elevation biomes - less affected by moisture, more by temperature
  if (elevation < ELEVATION_BANDS.HIGH) {
    if (temperature < TEMPERATURE_THRESHOLDS.COOL) {
      // Cold areas get tundra or snow
      return moisture < MOISTURE_THRESHOLDS.WET
        ? BiomeType.TUNDRA
        : BiomeType.SNOW;
    } else {
      // Warmer areas get shrubland or taiga
      return moisture < MOISTURE_THRESHOLDS.MEDIUM
        ? BiomeType.SHRUBLAND
        : BiomeType.TAIGA;
    }
  }

  // Very high elevation biomes - mostly affected by temperature
  if (elevation < ELEVATION_BANDS.VERY_HIGH) {
    if (temperature < TEMPERATURE_THRESHOLDS.COLD) {
      // Very cold high areas get snow
      return BiomeType.SNOW;
    } else if (moisture < MOISTURE_THRESHOLDS.MEDIUM) {
      return BiomeType.BARE;
    } else {
      return BiomeType.SCORCHED;
    }
  }

  // Highest elevations - mostly snow, but can be bare or scorched in warmer areas
  if (temperature < TEMPERATURE_THRESHOLDS.COOL) {
    return BiomeType.SNOW;
  } else if (moisture < MOISTURE_THRESHOLDS.MEDIUM) {
    return BiomeType.BARE;
  } else {
    return BiomeType.SCORCHED;
  }
}

/**
 * Get a color for the moisture visualization mode
 * @param value Moisture value (0-1)
 * @returns RGB color representing the moisture level
 */
export function getMoistureColor(value: number): RGB {
  // Blue gradient from light to dark
  const intensity = Math.floor(200 * value);
  return {
    r: 20,
    g: 20 + intensity,
    b: 150 + intensity,
  };
}

/**
 * Get a color for the elevation visualization mode
 * @param value Elevation value (0-1)
 * @returns RGB color representing the elevation
 */
export function getElevationColor(value: number): RGB {
  // Earth-toned gradient from sea level to mountain top
  if (value < ELEVATION_BANDS.WATER_SHALLOW) {
    // Water - blue to cyan gradient
    const normalizedDepth = value / ELEVATION_BANDS.WATER_SHALLOW;
    return {
      r: 0,
      g: Math.floor(150 * normalizedDepth),
      b: 255 - Math.floor(50 * normalizedDepth),
    };
  } else if (value < ELEVATION_BANDS.LOW) {
    // Low ground - green to yellow
    const normalizedHeight =
      (value - ELEVATION_BANDS.WATER_SHALLOW) /
      (ELEVATION_BANDS.LOW - ELEVATION_BANDS.WATER_SHALLOW);
    return {
      r: Math.floor(200 * normalizedHeight),
      g: 150 + Math.floor(50 * normalizedHeight),
      b: 0,
    };
  } else if (value < ELEVATION_BANDS.HIGH) {
    // Medium to high - yellow to brown
    const normalizedHeight =
      (value - ELEVATION_BANDS.LOW) /
      (ELEVATION_BANDS.HIGH - ELEVATION_BANDS.LOW);
    return {
      r: 200 - Math.floor(120 * normalizedHeight),
      g: 200 - Math.floor(160 * normalizedHeight),
      b: Math.floor(70 * normalizedHeight),
    };
  } else {
    // High to peak - brown to white
    const normalizedHeight =
      (value - ELEVATION_BANDS.HIGH) / (1 - ELEVATION_BANDS.HIGH);
    return {
      r: 80 + Math.floor(175 * normalizedHeight),
      g: 40 + Math.floor(215 * normalizedHeight),
      b: 70 + Math.floor(185 * normalizedHeight),
    };
  }
}
