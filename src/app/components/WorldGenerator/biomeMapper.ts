/**
 * biomeMapper.ts
 *
 * This module contains functionality for mapping elevation, moisture, and temperature values
 * to specific biomes, creating a realistic world with diverse biome types.
 * Based on the Whittaker diagram which classifies biomes based on
 * temperature and precipitation (moisture).
 */

import {
  BiomeType,
  BIOME_COLORS,
  MOISTURE_THRESHOLDS,
  RGB,
  TEMPERATURE_THRESHOLDS,
<<<<<<< HEAD
  ELEVATION_BANDS,
} from "./config";
import { normalize } from "./noiseGenerator";
=======
  ELEVATION_THRESHOLDS,
} from "./config";
>>>>>>> 80502046d576f72739e673a4aeafd82df96a0a43

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
  elevationThresholds?: any; // Using 'any' temporarily
}

/**
 * Helper to convert RGB to CSS string
 */
export const rgbToString = (color: RGB): string => {
  return `rgb(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(
    color.b
  )})`;
};

/**
 * Linear interpolation between two values
 */
export const lerp = (a: number, b: number, t: number): number => {
  return a + t * (b - a);
};

/**
 * Linear interpolation between two colors
 */
export const lerpColor = (colorA: RGB, colorB: RGB, t: number): RGB => {
  return {
    r: lerp(colorA.r, colorB.r, t),
    g: lerp(colorA.g, colorB.g, t),
    b: lerp(colorA.b, colorB.b, t),
  };
};

/**
 * Get the color for a given biome
 */
export function getBiomeColor(biome: BiomeType): RGB {
  return BIOME_COLORS[biome];
}

/**
 * Get a color representing elevation for visualization
 */
export function getElevationColor(value: number): RGB {
  // Gradient from deep blue (low) to white (high)
  if (value < ELEVATION_BANDS.WATER_SHALLOW) {
    // Water: Deep blue to light blue
    const normalizedValue = value / ELEVATION_BANDS.WATER_SHALLOW;
    return {
      r: Math.floor(normalizedValue * 150),
      g: Math.floor(100 + normalizedValue * 155),
      b: 255,
    };
  } else {
    // Land: Green to brown to white
    const normalizedValue =
      (value - ELEVATION_BANDS.WATER_SHALLOW) /
      (1.0 - ELEVATION_BANDS.WATER_SHALLOW);
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
  const elevationThresholds = data.elevationThresholds || ELEVATION_THRESHOLDS;

  // Deep water biomes - only affected by elevation, not moisture or temperature
  if (elevation < elevationThresholds.WATER_DEEP) {
    return BiomeType.OCEAN_DEEP;
  }

  // Medium water biomes
  if (elevation < elevationThresholds.WATER_MEDIUM) {
    return BiomeType.OCEAN_MEDIUM;
  }

  // Shallow water biomes
  if (elevation < elevationThresholds.WATER_SHALLOW) {
    return BiomeType.OCEAN_SHALLOW;
  }

  // Shore biomes - affected by temperature and moisture
  if (elevation < elevationThresholds.SHORE) {
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
  if (elevation < elevationThresholds.LOW) {
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
  if (elevation < elevationThresholds.MEDIUM) {
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
  if (elevation < elevationThresholds.HIGH) {
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
  if (elevation < elevationThresholds.VERY_HIGH) {
    if (temperature < temperatureThresholds.COOL) {
      return BiomeType.SNOW;
    } else if (temperature < temperatureThresholds.MILD) {
      return BiomeType.BARE;
    } else {
      return BiomeType.SCORCHED;
    }
  }

  // Extreme elevation
  return BiomeType.SNOW; // Default to snow for the highest peaks
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
 * Get a color representing temperature level for visualization
 */
export function getTemperatureColor(value: number): RGB {
  if (value < 0.2) {
    // Cold: blue to white
    const t = value / 0.2;
    return { r: 150 * t, g: 150 * t, b: 220 + 35 * t };
  } else if (value < 0.5) {
    // Cool: white to green
    const t = (value - 0.2) / 0.3;
    return { r: 150 - 100 * t, g: 150 + 60 * t, b: 255 - 155 * t };
  } else if (value < 0.8) {
    // Warm: green to yellow
    const t = (value - 0.5) / 0.3;
    return { r: 50 + 205 * t, g: 210, b: 100 - 100 * t };
  } else {
    // Hot: yellow to red
    const t = (value - 0.8) / 0.2;
    return { r: 255, g: 210 - 190 * t, b: 0 };
  }
}
