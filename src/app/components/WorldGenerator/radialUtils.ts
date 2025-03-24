/**
 * radialUtils.ts
 *
 * Utility functions for creating radial gradient effects on the map.
 * This is used to create a falloff effect from the center of the map to the edges,
 * allowing for central continents surrounded by ocean.
 */

import { WORLD_GRID_HEIGHT, WORLD_GRID_WIDTH } from "./config";

/**
 * Parameters for the radial gradient effect
 */
export interface RadialGradientParams {
  centerX?: number; // Center X position (0-1, default 0.5)
  centerY?: number; // Center Y position (0-1, default 0.5)
  radius?: number; // Normalized radius of the inner area (0-1, default 0.6)
  falloffExponent?: number; // Controls how sharp the transition is (default 3)
  strength?: number; // Overall strength of the effect (0-1, default 0.7)
}

/**
 * Default parameters for the radial gradient
 */
export const DEFAULT_RADIAL_PARAMS: RadialGradientParams = {
  centerX: 0.5, // Center of the map
  centerY: 0.5, // Center of the map
  radius: 0.6, // Inner radius covers 60% of the map
  falloffExponent: 3, // Cubic falloff for smoother transition
  strength: 0.7, // 70% strength, balanced effect
};

/**
 * Calculate the distance from a point to the center, normalized to [0,1]
 *
 * @param x X-coordinate in world grid
 * @param y Y-coordinate in world grid
 * @param params Radial gradient parameters
 * @returns Normalized distance from center [0,1] where 0 is center, 1 is furthest corner
 */
export function calculateNormalizedDistance(
  x: number,
  y: number,
  params: RadialGradientParams = DEFAULT_RADIAL_PARAMS
): number {
  // Get center coordinates in world grid units
  const centerX = (params.centerX || 0.5) * WORLD_GRID_WIDTH;
  const centerY = (params.centerY || 0.5) * WORLD_GRID_HEIGHT;

  // Calculate Euclidean distance
  const dx = x - centerX;
  const dy = y - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Calculate maximum possible distance (from center to furthest corner)
  const maxDistance = Math.sqrt(
    Math.pow(Math.max(centerX, WORLD_GRID_WIDTH - centerX), 2) +
      Math.pow(Math.max(centerY, WORLD_GRID_HEIGHT - centerY), 2)
  );

  // Return normalized distance
  return distance / maxDistance;
}

/**
 * Apply a radial gradient effect to an elevation value
 *
 * @param x X-coordinate in world grid
 * @param y Y-coordinate in world grid
 * @param elevation Original elevation value [0,1]
 * @param params Radial gradient parameters
 * @returns Modified elevation value [0,1]
 */
export function applyRadialGradient(
  x: number,
  y: number,
  elevation: number,
  params: RadialGradientParams = DEFAULT_RADIAL_PARAMS
): number {
  // Get parameters with fallbacks
  const radius = params.radius || 0.6;
  const falloffExponent = params.falloffExponent || 3;
  const strength = params.strength || 0.7;

  // Calculate normalized distance from center
  const distance = calculateNormalizedDistance(x, y, params);

  // If within inner radius, don't modify elevation
  if (distance <= radius) {
    return elevation;
  }

  // Calculate falloff factor in the range [0,1]
  // 0 = at inner radius, 1 = at map edge
  const falloffDistance = (distance - radius) / (1 - radius);

  // Apply non-linear falloff using exponent
  const falloff = Math.pow(falloffDistance, falloffExponent);

  // Calculate final elevation by applying falloff
  // As falloff increases (approaches 1), elevation decreases toward 0
  const modifiedElevation = elevation * (1 - falloff * strength);

  return modifiedElevation;
}
