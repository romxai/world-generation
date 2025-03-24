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
  bandScale?: number; // Scale factor for temperature bands (1.0 = normal)
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
  bandScale: 1.0, // Default scale factor for temperature bands
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
  const bandScale = params.bandScale || 1.0;

  // Calculate distance from equator (0 = at equator, 1 = at pole)
  let distanceFromEquator =
    Math.abs(latitude - equatorPos) / Math.max(equatorPos, 1 - equatorPos);

  // Apply band scaling - higher values make the bands narrower (more extreme temperatures)
  // Lower values make the bands wider (more moderate temperatures)
  if (bandScale !== 1.0) {
    // Ensure distance stays in [0, 1] range
    distanceFromEquator = Math.pow(distanceFromEquator, 1 / bandScale);
  }

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
  // Get the latitude (0-1, where 0 is south pole, 1 is north pole)
  const latitude = getLatitude(y);

  // Calculate base temperature based on latitude
  let temperature = calculateBaseTemperature(latitude, params);

  // Add some random variation
  const variance = params.temperatureVariance || 0.2;
  temperature += (Math.random() * 2 - 1) * variance * 0.1;

  // Higher elevation means colder temperature
  const elevationEffect = params.elevationEffect || 0.3;
  temperature -= elevation * elevationEffect;

  // Ensure temperature is in the valid range [0, 1]
  return Math.max(0, Math.min(1, temperature));
}

/**
 * Get a color representation of a temperature value
 * @param temperature Temperature value (0-1)
 * @returns RGB color object
 */
export function getTemperatureColor(temperature: number): {
  r: number;
  g: number;
  b: number;
} {
  // Cold: Blue (0, 100, 255)
  // Mild: Green (0, 255, 0)
  // Hot: Red (255, 0, 0)

  let r, g, b;

  if (temperature < 0.25) {
    // Cold: Deep blue to lighter blue
    const t = temperature / 0.25;
    r = 0;
    g = Math.floor(100 + t * 100);
    b = 255;
  } else if (temperature < 0.5) {
    // Cool: Blue-green to green
    const t = (temperature - 0.25) / 0.25;
    r = 0;
    g = Math.floor(200 + t * 55);
    b = Math.floor(255 - t * 255);
  } else if (temperature < 0.75) {
    // Warm: Green to yellow
    const t = (temperature - 0.5) / 0.25;
    r = Math.floor(t * 255);
    g = 255;
    b = 0;
  } else {
    // Hot: Yellow to red
    const t = (temperature - 0.75) / 0.25;
    r = 255;
    g = Math.floor(255 - t * 255);
    b = 0;
  }

  return { r, g, b };
}
