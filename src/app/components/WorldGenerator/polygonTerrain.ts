// Polygon-based terrain generation using Voronoi diagrams and Lloyd relaxation

import {
  Point,
  Polygon,
  generatePolygonMesh,
  isPointInPolygon,
} from "./polygonUtils";
import { TerrainType, calculateTerrainHeights } from "./config";
import { RGB, getTerrainTypeForHeight, getTerrainColor } from "./terrainUtils";
import { PerlinNoise } from "./noiseGenerator";

// Interface for terrain polygon with additional terrain properties
export interface TerrainPolygon extends Polygon {
  terrainType: TerrainType;
  noiseValue: number;
  color: RGB;
  gridCells: { x: number; y: number }[]; // Grid cells covered by this polygon
}

/**
 * Generate terrain using polygons instead of rectangular tiles
 * @param worldWidth Width of the world grid
 * @param worldHeight Height of the world grid
 * @param polygonCount Number of polygons to generate
 * @param seed Random seed for reproducibility
 * @param noiseGenerator Noise generator for terrain height
 * @param biomeWeights Weights for different biomes
 * @param relaxationSteps Number of Lloyd relaxation steps to apply
 * @returns Array of terrain polygons
 */
export const generatePolygonTerrain = (
  worldWidth: number,
  worldHeight: number,
  polygonCount: number,
  seed: number,
  noiseGenerator: PerlinNoise,
  biomeWeights: number[],
  relaxationSteps: number = 2
): TerrainPolygon[] => {
  // Generate a polygon mesh using Voronoi diagrams and Lloyd relaxation
  const polygons = generatePolygonMesh(
    polygonCount,
    worldWidth,
    worldHeight,
    seed,
    relaxationSteps
  );

  // Calculate terrain heights based on biome weights
  const terrainHeights = calculateTerrainHeights(biomeWeights);

  // Create a function to get noise values for a specific world position
  const getNoise = (x: number, y: number): number => {
    // Scale coordinates to ensure landscape features have appropriate sizes
    // Dividing by a larger number creates larger continents/islands
    const noiseX = x / 100;
    const noiseY = y / 100;
    return noiseGenerator.get(noiseX, noiseY);
  };

  // Convert polygons to terrain polygons
  const terrainPolygons: TerrainPolygon[] = polygons.map((polygon) => {
    // Get noise value at the center of the polygon
    const noiseValue = getNoise(polygon.center.x, polygon.center.y);

    // Determine terrain type based on noise value
    const terrainType = getTerrainTypeForHeight(noiseValue, terrainHeights);

    // Get color for the terrain
    const color = getTerrainColor(noiseValue, terrainType, terrainHeights);

    return {
      ...polygon,
      terrainType,
      noiseValue,
      color,
      gridCells: [], // Will be populated later
    };
  });

  // Associate grid cells with polygons
  for (let y = 0; y < worldHeight; y++) {
    for (let x = 0; x < worldWidth; x++) {
      const cellCenter: Point = { x: x + 0.5, y: y + 0.5 };

      // Find which polygon contains this grid cell
      for (const polygon of terrainPolygons) {
        if (isPointInPolygon(cellCenter, polygon.vertices)) {
          polygon.gridCells.push({ x, y });
          break;
        }
      }
    }
  }

  return terrainPolygons;
};

/**
 * Find the polygon containing a specific world position
 * @param x X coordinate in world space
 * @param y Y coordinate in world space
 * @param polygons Array of terrain polygons
 * @returns The terrain polygon containing the point, or undefined if not found
 */
export const findPolygonAtPosition = (
  x: number,
  y: number,
  polygons: TerrainPolygon[]
): TerrainPolygon | undefined => {
  const point: Point = { x, y };

  // First try quick lookup by nearby polygon centers
  const nearestPolygons = [...polygons].sort((a, b) => {
    const distA = Math.pow(a.center.x - x, 2) + Math.pow(a.center.y - y, 2);
    const distB = Math.pow(b.center.x - x, 2) + Math.pow(b.center.y - y, 2);
    return distA - distB;
  });

  // Check the nearest few polygons first for efficiency
  for (let i = 0; i < Math.min(10, nearestPolygons.length); i++) {
    if (isPointInPolygon(point, nearestPolygons[i].vertices)) {
      return nearestPolygons[i];
    }
  }

  // If not found in nearest, check all polygons
  for (const polygon of polygons) {
    if (isPointInPolygon(point, polygon.vertices)) {
      return polygon;
    }
  }

  return undefined;
};

/**
 * Generate a rasterized image from polygon terrain
 * This converts polygon-based terrain to a pixel-based image for rendering
 * @param polygons Array of terrain polygons
 * @param width Width of the output image in pixels
 * @param height Height of the output image in pixels
 * @param worldWidth Width of the world in world units
 * @param worldHeight Height of the world in world units
 * @returns ImageData that can be rendered to a canvas
 */
export const rasterizePolygonTerrain = (
  polygons: TerrainPolygon[],
  width: number,
  height: number,
  worldWidth: number,
  worldHeight: number
): ImageData => {
  // Create image data for rasterization
  const imageData = new ImageData(width, height);

  // Calculate scale factors to convert world coordinates to pixel coordinates
  const scaleX = width / worldWidth;
  const scaleY = height / worldHeight;

  // For each pixel in the output image
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Convert pixel coordinates to world coordinates
      const worldX = x / scaleX;
      const worldY = y / scaleY;

      // Find the polygon containing this pixel
      const polygon = findPolygonAtPosition(worldX, worldY, polygons);

      // If a polygon is found, color the pixel
      if (polygon) {
        const color = polygon.color;
        const i = (y * width + x) * 4;

        imageData.data[i] = color.r;
        imageData.data[i + 1] = color.g;
        imageData.data[i + 2] = color.b;
        imageData.data[i + 3] = 255; // Full opacity
      }
    }
  }

  return imageData;
};

/**
 * Get all grid cells covered by visible polygons
 * @param polygons Array of terrain polygons
 * @param startX Start X coordinate of visible area
 * @param startY Start Y coordinate of visible area
 * @param endX End X coordinate of visible area
 * @param endY End Y coordinate of visible area
 * @returns Array of grid cell coordinates covered by visible polygons
 */
export const getVisibleGridCells = (
  polygons: TerrainPolygon[],
  startX: number,
  startY: number,
  endX: number,
  endY: number
): { x: number; y: number; terrainType: TerrainType; noiseValue: number }[] => {
  const visibleCells: {
    x: number;
    y: number;
    terrainType: TerrainType;
    noiseValue: number;
  }[] = [];

  // Add all grid cells covered by polygons within the visible area
  for (const polygon of polygons) {
    // Quick check if polygon might be visible (check if center is in range)
    if (
      polygon.center.x >= startX - 10 &&
      polygon.center.x <= endX + 10 &&
      polygon.center.y >= startY - 10 &&
      polygon.center.y <= endY + 10
    ) {
      // Add grid cells from this polygon that are in the visible range
      for (const cell of polygon.gridCells) {
        if (
          cell.x >= startX &&
          cell.x <= endX &&
          cell.y >= startY &&
          cell.y <= endY
        ) {
          visibleCells.push({
            x: cell.x,
            y: cell.y,
            terrainType: polygon.terrainType,
            noiseValue: polygon.noiseValue,
          });
        }
      }
    }
  }

  return visibleCells;
};
