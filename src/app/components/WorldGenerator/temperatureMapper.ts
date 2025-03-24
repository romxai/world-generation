/**
 * temperatureMapper.ts
 *
 * This module handles the temperature calculations based on latitude/longitude
 * to create more realistic climate zones on the world map.
 */

import { WORLD_GRID_HEIGHT, WORLD_GRID_WIDTH } from "./config";

/**
 * Temperature zones constants
 */
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

/**
 * Parameters for temperature calculation
 */
export interface TemperatureParams {
  equatorPosition?: number; // Where the equator is located (0-1, default 0.5)
  temperatureVariance?: number; // How much temperature varies (0-1, default 0.2)
  polarTemperature?: number; // Base temperature at poles (0-1, default 0.1)
  equatorTemperature?: number; // Base temperature at equator (0-1, default 0.9)
  elevationEffect?: number; // How much elevation affects temperature (0-1, default 0.3)
}

/**
 * Default temperature parameters
 */
export const DEFAULT_TEMPERATURE_PARAMS: TemperatureParams = {
  equatorPosition: 0.5, // Middle of the map
  temperatureVariance: 0.2, // Slight variance for realism
  polarTemperature: 0.1, // Cold poles
  equatorTemperature: 0.9, // Hot equator
  elevationEffect: 0.3, // Higher elevation = cooler temperature
};

/**
 * Calculate the base temperature at a given latitude
 * @param latitude Normalized latitude value (0-1, where 0 is south pole, 1 is north pole)
 * @param params Temperature calculation parameters
 * @returns Temperature value (0-1, where 0 is coldest, 1 is hottest)
 */
export function calculateBaseTemperature(
  latitude: number,
  params: TemperatureParams = DEFAULT_TEMPERATURE_PARAMS
): number {
  const equatorPos = params.equatorPosition || 0.5;
  const polarTemp = params.polarTemperature || 0.1;
  const equatorTemp = params.equatorTemperature || 0.9;

  // Calculate distance from equator (0 = at equator, 1 = at pole)
  const distanceFromEquator =
    Math.abs(latitude - equatorPos) / Math.max(equatorPos, 1 - equatorPos);

  // Temperature decreases as you move away from the equator (cosine pattern)
  const temperatureFactor = Math.cos((distanceFromEquator * Math.PI) / 2);

  // Calculate final temperature
  return polarTemp + temperatureFactor * (equatorTemp - polarTemp);
}

/**
 * Calculate the normalized latitude (0-1) from a y-coordinate in the world grid
 * @param y The y-coordinate in the world grid
 * @returns Normalized latitude (0 = south pole, 1 = north pole)
 */
export function getLatitude(y: number): number {
  return y / WORLD_GRID_HEIGHT;
}

/**
 * Calculate the normalized longitude (0-1) from an x-coordinate in the world grid
 * @param x The x-coordinate in the world grid
 * @returns Normalized longitude (0 = west edge, 1 = east edge)
 */
export function getLongitude(x: number): number {
  return x / WORLD_GRID_WIDTH;
}

/**
 * Calculate temperature at a specific world coordinate, adjusting for elevation
 * @param x X-coordinate in the world grid
 * @param y Y-coordinate in the world grid
 * @param elevation Elevation value at the coordinate (0-1)
 * @param params Temperature calculation parameters
 * @returns Final temperature value (0-1)
 */
export function calculateTemperature(
  x: number,
  y: number,
  elevation: number,
  params: TemperatureParams = DEFAULT_TEMPERATURE_PARAMS
): number {
  // Get latitude and calculate base temperature
  const latitude = getLatitude(y);
  let temperature = calculateBaseTemperature(latitude, params);

  // Add random variation for more natural patterns
  const elevationEffect = params.elevationEffect || 0.3;
  const variance = params.temperatureVariance || 0.2;

  // Higher elevation means cooler temperature
  temperature -= elevation * elevationEffect;

  // Add some random variance (could be based on longitude or other factors)
  const longitudeFactor = Math.sin(getLongitude(x) * Math.PI * 2);
  temperature += longitudeFactor * variance * 0.8;

  // Clamp temperature to valid range
  return Math.max(0, Math.min(1, temperature));
}

/**
 * Get a color representing the temperature for visualization
 * @param temperature Temperature value (0-1)
 * @returns RGB color representing the temperature
 */
export function getTemperatureColor(temperature: number): {
  r: number;
  g: number;
  b: number;
} {
  // Temperature gradient from blue (cold) to red (hot)
  if (temperature < 0.2) {
    // Blue to cyan (coldest)
    return {
      r: 0,
      g: Math.floor(200 * (temperature / 0.2)),
      b: 255,
    };
  } else if (temperature < 0.4) {
    // Cyan to green (cold)
    const factor = (temperature - 0.2) / 0.2;
    return {
      r: 0,
      g: 200 + Math.floor(55 * factor),
      b: 255 - Math.floor(255 * factor),
    };
  } else if (temperature < 0.6) {
    // Green to yellow (mild)
    const factor = (temperature - 0.4) / 0.2;
    return {
      r: Math.floor(255 * factor),
      g: 255,
      b: 0,
    };
  } else if (temperature < 0.8) {
    // Yellow to orange (warm)
    const factor = (temperature - 0.6) / 0.2;
    return {
      r: 255,
      g: 255 - Math.floor(155 * factor),
      b: 0,
    };
  } else {
    // Orange to red (hot)
    const factor = (temperature - 0.8) / 0.2;
    return {
      r: 255,
      g: 100 - Math.floor(100 * factor),
      b: Math.floor(100 * factor), // Adding a bit of blue for purple at the highest temps
    };
  }
}
