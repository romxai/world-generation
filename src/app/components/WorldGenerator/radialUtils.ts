/**
 * radialUtils.ts
 *
 * Utility functions for creating radial gradient effects on the map.
 * This is used to create a falloff effect from the center of the map to the edges,
 * allowing for central continents surrounded by ocean.
 */

import {
  WORLD_GRID_HEIGHT,
  WORLD_GRID_WIDTH,
  RadialGradientParams,
  DEFAULT_RADIAL_PARAMS,
} from "./config";

// Re-export DEFAULT_RADIAL_PARAMS for backward compatibility
export { DEFAULT_RADIAL_PARAMS };

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
  // Use provided parameters or defaults
  const centerX =
    (params.centerX || DEFAULT_RADIAL_PARAMS.centerX!) * WORLD_GRID_WIDTH;
  const centerY =
    (params.centerY || DEFAULT_RADIAL_PARAMS.centerY!) * WORLD_GRID_HEIGHT;

  // Calculate distance from center in grid units
  const dx = x - centerX;
  const dy = y - centerY;

  // Calculate distance and normalize to the maximum possible distance
  // Use diagonal distance for proper normalization
  const maxDistance = Math.sqrt(
    Math.pow(Math.max(centerX, WORLD_GRID_WIDTH - centerX), 2) +
      Math.pow(Math.max(centerY, WORLD_GRID_HEIGHT - centerY), 2)
  );

  const distance = Math.sqrt(dx * dx + dy * dy);
  return Math.min(distance / maxDistance, 1.0);
}

/**
 * Apply a radial gradient effect to an elevation value
 *
 * @param x X-coordinate in world grid
 * @param y Y-coordinate in world grid
 * @param elevation Original elevation value (0-1)
 * @param params Radial gradient parameters
 * @returns Modified elevation value (0-1)
 */
export function applyRadialGradient(
  x: number,
  y: number,
  elevation: number,
  params: RadialGradientParams = DEFAULT_RADIAL_PARAMS
): number {
  // Get normalized distance from center
  const distance = calculateNormalizedDistance(x, y, params);

  // Get parameters with defaults
  const radius = params.radius || DEFAULT_RADIAL_PARAMS.radius!;
  const falloffExponent =
    params.falloffExponent || DEFAULT_RADIAL_PARAMS.falloffExponent!;
  const strength = params.strength || DEFAULT_RADIAL_PARAMS.strength!;

  // No effect inside the inner radius
  if (distance <= radius) {
    return elevation;
  }

  // Calculate falloff factor
  const normalizedDistance = (distance - radius) / (1.0 - radius);
  const falloff = Math.pow(normalizedDistance, falloffExponent);

  // Apply falloff to original elevation (higher strength = more ocean at edges)
  return elevation * (1.0 - falloff * strength);
}
