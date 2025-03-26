// Utility functions for color conversion and interpolation

import { RGB, BiomeType } from "./config";
import { normalize } from "./noiseGenerator";

// Helper to convert RGB to CSS string
export const rgbToString = (color: RGB): string => {
  return `rgb(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(
    color.b
  )})`;
};

// Linearly interpolate between two RGB colors
export const lerpColor = (color1: RGB, color2: RGB, amount: number): RGB => {
  // Clamp amount between 0 and 1
  const t = Math.max(0, Math.min(1, amount));

  return {
    r: color1.r + t * (color2.r - color1.r),
    g: color1.g + t * (color2.g - color1.g),
    b: color1.b + t * (color2.b - color1.b),
  };
};

// Interface for a world tile with BiomeType
export interface Tile {
  biomeType: BiomeType;
  color: RGB;
  noiseValue: number;
  x: number;
  y: number;
}

// Determine tile edge type based on neighbors (for border drawing)
// Values 0-15 represent different combinations of edges
export const getTileEdgeType = (
  x: number,
  y: number,
  grid: Tile[][],
  biomeType: BiomeType
): number => {
  const height = grid.length;
  const width = grid[0].length;

  // Check if neighboring tiles have same biome
  // We check in clockwise order: top, right, bottom, left
  const top = y > 0 ? grid[y - 1][x].biomeType === biomeType : false;
  const right = x < width - 1 ? grid[y][x + 1].biomeType === biomeType : false;
  const bottom =
    y < height - 1 ? grid[y + 1][x].biomeType === biomeType : false;
  const left = x > 0 ? grid[y][x - 1].biomeType === biomeType : false;

  // Create binary value based on tile edges
  // This gives a value from 0-15 representing different configurations
  let edgeType = 0;
  if (top) edgeType |= 1; // 0001
  if (right) edgeType |= 2; // 0010
  if (bottom) edgeType |= 4; // 0100
  if (left) edgeType |= 8; // 1000

  return edgeType;
};
