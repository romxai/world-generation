// Terrain utility functions for tile generation and coloring

import {
  TerrainType,
  TERRAIN_HEIGHTS,
  TERRAIN_COLORS,
  ALL_TERRAIN_TYPES,
  RGB,
} from "./config";
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

// Determine terrain type from noise value
// Now accepts an optional terrainHeights parameter for dynamic height thresholds
export const getTerrainTypeForHeight = (
  noiseValue: number,
  terrainHeights = TERRAIN_HEIGHTS
): TerrainType => {
  for (const terrainType of ALL_TERRAIN_TYPES) {
    const heights = terrainHeights[terrainType];
    if (noiseValue <= heights.max) {
      return terrainType;
    }
  }
  // Fallback to highest terrain type
  return TerrainType.SNOW;
};

// Get correct color for a terrain based on noise value
// Now accepts an optional terrainHeights parameter for dynamic height thresholds
export const getTerrainColor = (
  noiseValue: number,
  terrainType: TerrainType,
  terrainHeights = TERRAIN_HEIGHTS
): RGB => {
  const terrain = TERRAIN_COLORS[terrainType];
  const heights = terrainHeights[terrainType];

  // Normalize noise value within terrain height range and apply adjustment
  let t = normalize(noiseValue, heights.min, heights.max);
  t = Math.max(0, Math.min(1, t + terrain.lerpAdjustment));

  // Interpolate between min and max color
  return lerpColor(terrain.min, terrain.max, t);
};

// Interface for a world tile
export interface Tile {
  terrainType: TerrainType;
  color: RGB;
  noiseValue: number;
  x: number;
  y: number;
}

// Generate a grid of tiles based on noise values
// Now accepts an optional terrainHeights parameter for dynamic height thresholds
export const generateTileGrid = (
  width: number,
  height: number,
  getNoise: (x: number, y: number) => number,
  terrainHeights = TERRAIN_HEIGHTS
): Tile[][] => {
  const grid: Tile[][] = [];

  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      const noiseValue = getNoise(x, y);
      const terrainType = getTerrainTypeForHeight(noiseValue, terrainHeights);
      const color = getTerrainColor(noiseValue, terrainType, terrainHeights);

      row.push({
        terrainType,
        color,
        noiseValue,
        x,
        y,
      });
    }
    grid.push(row);
  }

  return grid;
};

// Determine tile edge type based on neighbors (for border drawing)
// Values 0-15 represent different combinations of edges
export const getTileEdgeType = (
  x: number,
  y: number,
  grid: Tile[][],
  terrainType: TerrainType
): number => {
  const height = grid.length;
  const width = grid[0].length;

  // Check if neighboring tiles have same terrain
  // We check in clockwise order: top, right, bottom, left
  const top = y > 0 ? grid[y - 1][x].terrainType === terrainType : false;
  const right =
    x < width - 1 ? grid[y][x + 1].terrainType === terrainType : false;
  const bottom =
    y < height - 1 ? grid[y + 1][x].terrainType === terrainType : false;
  const left = x > 0 ? grid[y][x - 1].terrainType === terrainType : false;

  // Create binary value based on tile edges
  // This gives a value from 0-15 representing different configurations
  let edgeType = 0;
  if (top) edgeType |= 1; // 0001
  if (right) edgeType |= 2; // 0010
  if (bottom) edgeType |= 4; // 0100
  if (left) edgeType |= 8; // 1000

  return edgeType;
};

// Debugging function to print terrain information
export const debugTerrain = (tile: Tile): string => {
  const terrainNames = [
    "DEEP_OCEAN",
    "MEDIUM_OCEAN",
    "SHALLOW_OCEAN",
    "BEACH",
    "GRASS",
    "MOUNTAIN",
    "SNOW",
  ];

  return `Tile(${tile.x},${tile.y}) - ${
    terrainNames[tile.terrainType]
  } - Noise: ${tile.noiseValue.toFixed(3)}`;
};
