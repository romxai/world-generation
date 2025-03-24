// WorldMap.tsx - Main component for rendering the procedurally generated world map
"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import {
  WORLD_GRID_WIDTH,
  WORLD_GRID_HEIGHT,
  DEFAULT_TILE_SIZE,
  DEFAULT_SEED,
  DEBUG_MODE,
  VisualizationMode,
  BIOME_PRESETS,
  TerrainType,
  BiomeType,
  NOISE_DETAIL,
  NOISE_FALLOFF,
  BIOME_COLORS,
  MOISTURE_THRESHOLDS,
  TEMPERATURE_THRESHOLDS,
  ELEVATION_THRESHOLDS,
  TEMPERATURE_ZONES,
  DEFAULT_TEMPERATURE_PARAMS,
  DEFAULT_RADIAL_PARAMS,
  DEFAULT_OCTAVES,
  DEFAULT_ELEVATION_SCALE,
  DEFAULT_MOISTURE_SCALE,
  DEFAULT_OCTAVE_WEIGHT,
} from "./config";
import { createNoiseGenerator } from "./noiseGenerator";
import { applyRadialGradient } from "./radialUtils";

// Constants for rendering thresholds
const GRID_VISIBLE_THRESHOLD = 0.4; // Zoom level at which grid becomes visible
const COORDS_VISIBLE_THRESHOLD = 0.6; // Zoom level at which coordinates become visible
const TILE_SIMPLIFICATION_THRESHOLD = 0.2; // Zoom level at which to simplify tiles
const LOW_RESOLUTION_THRESHOLD = 0.1; // Zoom level at which to use low resolution
const LOW_ZOOM_TILE_FACTOR = 4; // Skip factor for tiles when zoomed out
const MIN_ZOOM = 0.05;
const MAX_ZOOM = 5.0;
const INITIAL_ZOOM = 0.5;

// Helper function to convert RGB object to CSS color string
const rgbToString = (color: { r: number; g: number; b: number }): string => {
  return `rgb(${color.r}, ${color.g}, ${color.b})`;
};

// Utility functions
// Generate octaved noise for a grid of given dimensions
const generateOctavedNoise = ({
  width,
  height,
  seed,
  octaves,
  scale,
  persistence,
  detail,
  falloff,
}: {
  width: number;
  height: number;
  seed: number;
  octaves: number;
  scale: number;
  persistence: number;
  detail: number;
  falloff: number;
}): number[][] => {
  const noiseGen = createNoiseGenerator(seed, detail, falloff);
  const result: number[][] = Array(height)
    .fill(0)
    .map(() => Array(width).fill(0));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let amplitude = 1.0;
      let frequency = 1.0;
      let noiseValue = 0;
      let normalization = 0;

      // Combine multiple octaves of noise
      for (let o = 0; o < octaves; o++) {
        const sampleX = (x / scale) * frequency;
        const sampleY = (y / scale) * frequency;

        // Call get() method on the noise generator instance
        const value = noiseGen.get(sampleX, sampleY);
        noiseValue += value * amplitude;
        normalization += amplitude;

        amplitude *= persistence;
        frequency *= 2;
      }

      // Normalize the result
      result[y][x] = noiseValue / normalization;
    }
  }

  return result;
};

// Generate temperature values for a grid
const generateTemperature = ({
  width,
  height,
  equatorPosition,
  temperatureVariance,
  elevationEffect,
  bandScale,
  noiseScale = 8,
  noiseOctaves = 2,
  noisePersistence = 0.5,
  seed = 12345,
  polarTemperature = 0.1,
  equatorTemperature = 0.9,
}: {
  width: number;
  height: number;
  equatorPosition: number;
  temperatureVariance: number;
  elevationEffect: number;
  bandScale: number;
  noiseScale?: number;
  noiseOctaves?: number;
  noisePersistence?: number;
  seed?: number;
  polarTemperature?: number;
  equatorTemperature?: number;
}): number[][] => {
  // Generate noise for temperature variations
  const temperatureNoise = generateOctavedNoise({
    width,
    height,
    seed,
    octaves: noiseOctaves,
    scale: noiseScale,
    persistence: noisePersistence,
    detail: NOISE_DETAIL,
    falloff: NOISE_FALLOFF,
  });

  const result: number[][] = [];

  for (let y = 0; y < height; y++) {
    result[y] = [];
    for (let x = 0; x < width; x++) {
      // Calculate base temperature based on distance from equator
      const normalizedY = y / height;
      const distanceFromEquator = Math.abs(normalizedY - equatorPosition);

      // Apply band scaling to create wider or narrower temperature bands
      const scaledDistance = Math.pow(distanceFromEquator, bandScale);

      // Calculate temperature from poles to equator (0 to 1)
      const baseTemperature =
        polarTemperature +
        (equatorTemperature - polarTemperature) * (1 - scaledDistance);

      // Apply noise variation
      const noiseValue = temperatureNoise[y][x];
      const temperatureValue =
        baseTemperature + (noiseValue - 0.5) * temperatureVariance;

      // Clamp temperature to valid range [0, 1]
      result[y][x] = Math.max(0, Math.min(1, temperatureValue));
    }
  }

  return result;
};

// Determine biome type based on elevation, moisture, and temperature
const getBiomeTypeAt = (
  elevation: number,
  moisture: number,
  temperature: number,
  biomeWeights: number[],
  moistureThresholds: typeof MOISTURE_THRESHOLDS,
  temperatureThresholds: typeof TEMPERATURE_THRESHOLDS,
  elevationThresholds: typeof ELEVATION_THRESHOLDS
): BiomeType => {
  // Water tiles
  if (elevation < elevationThresholds.WATER_SHALLOW) {
    if (elevation < elevationThresholds.WATER_DEEP) {
      return BiomeType.OCEAN_DEEP;
    } else if (elevation < elevationThresholds.WATER_MEDIUM) {
      return BiomeType.OCEAN_MEDIUM;
    } else {
      return BiomeType.OCEAN_SHALLOW;
    }
  }

  // Shore/beach tiles
  if (elevation < elevationThresholds.SHORE) {
    // Determine beach or rocky shore based on temperature
    if (temperature > temperatureThresholds.COOL) {
      return BiomeType.BEACH;
    } else {
      return BiomeType.ROCKY_SHORE;
    }
  }

  // Land tiles - determine biome based on elevation, moisture, and temperature
  // Higher elevation
  if (elevation > elevationThresholds.HIGH) {
    if (elevation > elevationThresholds.VERY_HIGH) {
      // Very high elevation
      if (temperature < temperatureThresholds.COLD) {
        return BiomeType.SNOW;
      } else {
        return BiomeType.BARE;
      }
    } else {
      // High elevation
      if (temperature < temperatureThresholds.COLD) {
        return BiomeType.TUNDRA;
      } else {
        return BiomeType.TAIGA;
      }
    }
  }

  // Medium elevation
  if (elevation > elevationThresholds.MEDIUM) {
    if (moisture < moistureThresholds.DRY) {
      return BiomeType.SHRUBLAND;
    } else if (moisture < moistureThresholds.MEDIUM) {
      return BiomeType.TEMPERATE_GRASSLAND;
    } else {
      return BiomeType.TEMPERATE_DECIDUOUS_FOREST;
    }
  }

  // Low elevation
  if (moisture < moistureThresholds.DRY) {
    if (temperature > temperatureThresholds.HOT) {
      return BiomeType.SUBTROPICAL_DESERT;
    } else {
      return BiomeType.TEMPERATE_DESERT;
    }
  } else if (moisture < moistureThresholds.MEDIUM) {
    return BiomeType.GRASSLAND;
  } else {
    if (temperature > temperatureThresholds.WARM) {
      return BiomeType.TROPICAL_RAINFOREST;
    } else {
      return BiomeType.TROPICAL_SEASONAL_FOREST;
    }
  }
};

// Get color for a terrain type based on visualization mode
const getBiomeColor = (
  biomeType: BiomeType,
  visualizationMode: VisualizationMode,
  elevation: number,
  moisture: number,
  temperature: number
): string => {
  // Different coloring based on visualization mode
  switch (visualizationMode) {
    case VisualizationMode.ELEVATION:
      // Grayscale for elevation
      const elevationValue = Math.floor(elevation * 255);
      return `rgb(${elevationValue},${elevationValue},${elevationValue})`;

    case VisualizationMode.MOISTURE:
      // Blue shades for moisture
      const moistureValue = Math.floor(moisture * 255);
      return `rgb(0,${Math.floor(moistureValue * 0.5)},${moistureValue})`;

    case VisualizationMode.TEMPERATURE:
      // Red shades for temperature
      const temperatureValue = Math.floor(temperature * 255);
      return `rgb(${temperatureValue},${Math.floor(temperatureValue * 0.4)},0)`;

    case VisualizationMode.NOISE:
      // Raw noise visualization (grayscale)
      const noiseValue = Math.floor(elevation * 255);
      return `rgb(${noiseValue},${noiseValue},${noiseValue})`;

    case VisualizationMode.BIOME:
    default:
      // Use biome colors from config
      const color = BIOME_COLORS[biomeType];
      return rgbToString(color);
  }
};

// Types
interface WorldMapProps {
  width?: number;
  height?: number;
  tileSize?: number;
  seed?: number;
  debug?: boolean;
  biomeWeights?: number[];
  noiseDetail?: number;
  noiseFalloff?: number;
  visualizationMode?: VisualizationMode;
  // Advanced generation options
  elevationOctaves?: number;
  moistureOctaves?: number;
  elevationScale?: number;
  moistureScale?: number;
  elevationPersistence?: number;
  moisturePersistence?: number;
  // Temperature parameters
  temperatureParams?: {
    equatorPosition: number;
    temperatureVariance: number;
    elevationEffect: number;
    polarTemperature?: number;
    equatorTemperature?: number;
    bandScale: number;
    noiseScale?: number;
    noiseOctaves?: number;
    noisePersistence?: number;
    noiseSeed?: number;
  };
  // Radial gradient parameters for ocean effect
  radialGradientParams?: {
    centerX: number;
    centerY: number;
    radius: number;
    falloffExponent: number;
    strength: number;
  };
  // Threshold parameters
  moistureThresholds?: typeof MOISTURE_THRESHOLDS;
  temperatureThresholds?: typeof TEMPERATURE_THRESHOLDS;
  elevationThresholds?: typeof ELEVATION_THRESHOLDS;
}

interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

// Type for tile data
interface TileData {
  biomeType: BiomeType;
  color: string;
  elevation: number;
  moisture: number;
  temperature: number;
}

// Component implementation
const WorldMap: React.FC<WorldMapProps> = ({
  width: propWidth,
  height: propHeight,
  tileSize = DEFAULT_TILE_SIZE,
  seed = DEFAULT_SEED,
  debug = DEBUG_MODE,
  biomeWeights = BIOME_PRESETS.ISLANDS,
  noiseDetail = NOISE_DETAIL,
  noiseFalloff = NOISE_FALLOFF,
  visualizationMode = VisualizationMode.BIOME,
  // Advanced generation options
  elevationOctaves = DEFAULT_OCTAVES,
  moistureOctaves = DEFAULT_OCTAVES,
  elevationScale = DEFAULT_ELEVATION_SCALE,
  moistureScale = DEFAULT_MOISTURE_SCALE,
  elevationPersistence = DEFAULT_OCTAVE_WEIGHT,
  moisturePersistence = DEFAULT_OCTAVE_WEIGHT,
  // Temperature parameters
  temperatureParams = DEFAULT_TEMPERATURE_PARAMS,
  // Radial gradient parameters
  radialGradientParams = DEFAULT_RADIAL_PARAMS,
  // Threshold parameters
  moistureThresholds = MOISTURE_THRESHOLDS,
  temperatureThresholds = TEMPERATURE_THRESHOLDS,
  elevationThresholds = ELEVATION_THRESHOLDS,
}) => {
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // State for dimensions
  const [dimensions, setDimensions] = useState({
    width: propWidth || window.innerWidth,
    height: propHeight || window.innerHeight,
  });

  // State
  const [camera, setCamera] = useState<CameraState>({
    x: WORLD_GRID_WIDTH / 2,
    y: WORLD_GRID_HEIGHT / 2,
    zoom: INITIAL_ZOOM,
  });

  const [worldData, setWorldData] = useState<TileData[][]>([]);
  const [needsRender, setNeedsRender] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [hoveredTile, setHoveredTile] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Calculate tile size with zoom
  const getCurrentTileSize = (): number => {
    return tileSize * camera.zoom;
  };

  // Calculate which tiles are visible
  const getVisibleGridCells = () => {
    const currentTileSize = getCurrentTileSize();
    const isLowZoom = camera.zoom < LOW_RESOLUTION_THRESHOLD;

    // Determine skip factor for low zoom levels
    const skipFactor = isLowZoom ? LOW_ZOOM_TILE_FACTOR : 1;

    // Calculate how many tiles fit in the viewport
    const tilesX = Math.ceil(dimensions.width / currentTileSize) + 2; // Add buffer
    const tilesY = Math.ceil(dimensions.height / currentTileSize) + 2;

    // Calculate starting tile
    const startX = Math.max(0, Math.floor(camera.x - tilesX / 2));
    const startY = Math.max(0, Math.floor(camera.y - tilesY / 2));

    // Calculate ending tile
    const endX = Math.min(WORLD_GRID_WIDTH - 1, startX + tilesX);
    const endY = Math.min(WORLD_GRID_HEIGHT - 1, startY + tilesY);

    return { startX, startY, endX, endY, skipFactor, isLowZoom };
  };

  // Generate world data
  const generateWorld = () => {
    setIsGenerating(true);

    // Use timeout to allow UI to update before intensive computation
    setTimeout(() => {
      try {
        console.log(`Generating world with seed: ${seed}`);
        const startTime = performance.now();

        // Generate base noise for elevation
        const elevationNoise = generateOctavedNoise({
          width: WORLD_GRID_WIDTH,
          height: WORLD_GRID_HEIGHT,
          seed: seed,
          octaves: elevationOctaves,
          scale: elevationScale,
          persistence: elevationPersistence,
          detail: noiseDetail,
          falloff: noiseFalloff,
        });

        // Generate moisture noise
        const moistureNoise = generateOctavedNoise({
          width: WORLD_GRID_WIDTH,
          height: WORLD_GRID_HEIGHT,
          seed: seed + 1000, // Different seed for variation
          octaves: moistureOctaves,
          scale: moistureScale,
          persistence: moisturePersistence,
          detail: noiseDetail,
          falloff: noiseFalloff,
        });

        // Generate temperature data
        const temperatureData = generateTemperature({
          width: WORLD_GRID_WIDTH,
          height: WORLD_GRID_HEIGHT,
          equatorPosition: temperatureParams.equatorPosition || 0.5,
          temperatureVariance: temperatureParams.temperatureVariance || 0.2,
          elevationEffect: temperatureParams.elevationEffect || 0.3,
          bandScale: temperatureParams.bandScale || 1.0,
          noiseScale: temperatureParams.noiseScale,
          noiseOctaves: temperatureParams.noiseOctaves,
          noisePersistence: temperatureParams.noisePersistence,
          seed: temperatureParams.noiseSeed || seed + 2000,
          polarTemperature: temperatureParams.polarTemperature,
          equatorTemperature: temperatureParams.equatorTemperature,
        });

        // Create world data
        const newWorldData: TileData[][] = [];

        for (let y = 0; y < WORLD_GRID_HEIGHT; y++) {
          newWorldData[y] = [];
          for (let x = 0; x < WORLD_GRID_WIDTH; x++) {
            let elevation = elevationNoise[y][x];

            // Apply radial gradient
            elevation = applyRadialGradient(
              x,
              y,
              elevation,
              radialGradientParams
            );

            const moisture = moistureNoise[y][x];
            const temperature = temperatureData[y][x];

            // Determine biome type
            const biomeType = getBiomeTypeAt(
              elevation,
              moisture,
              temperature,
              biomeWeights,
              moistureThresholds,
              temperatureThresholds,
              elevationThresholds
            );

            // Get color based on visualization mode
            const color = getBiomeColor(
              biomeType,
              visualizationMode,
              elevation,
              moisture,
              temperature
            );

            // Store tile data
            newWorldData[y][x] = {
              biomeType,
              color,
              elevation,
              moisture,
              temperature,
            };
          }
        }

        const endTime = performance.now();
        console.log(
          `World generation completed in ${(endTime - startTime).toFixed(2)}ms`
        );

        // Update state
        setWorldData(newWorldData);
        setIsGenerating(false);
        setNeedsRender(true);
      } catch (error) {
        console.error("Error generating world:", error);
        setIsGenerating(false);
      }
    }, 50); // Small delay to allow UI to update
  };

  // Render the map
  const renderMap = () => {
    const canvas = canvasRef.current;
    const offscreenCanvas = offscreenCanvasRef.current;

    if (!canvas || !offscreenCanvas || worldData.length === 0) return;

    const ctx = canvas.getContext("2d");
    const offCtx = offscreenCanvas.getContext("2d");

    if (!ctx || !offCtx) return;

    // Clear the offscreen canvas
    offCtx.fillStyle = "#000";
    offCtx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

    // Get current rendering parameters
    const currentTileSize = getCurrentTileSize();
    const { startX, startY, endX, endY, skipFactor, isLowZoom } =
      getVisibleGridCells();

    // Calculate offset for centering
    const offsetX = (camera.x - Math.floor(camera.x)) * currentTileSize;
    const offsetY = (camera.y - Math.floor(camera.y)) * currentTileSize;

    // Draw visible tiles
    for (let y = startY; y <= endY; y += skipFactor) {
      for (let x = startX; x <= endX; x += skipFactor) {
        if (x >= WORLD_GRID_WIDTH || y >= WORLD_GRID_HEIGHT) continue;

        // Get tile data
        const tile = worldData[y][x];

        // Calculate screen position
        const screenX =
          (x - startX) * currentTileSize - offsetX + dimensions.width / 2;
        const screenY =
          (y - startY) * currentTileSize - offsetY + dimensions.height / 2;

        // Determine size to render (larger for skipped tiles)
        const renderSize = isLowZoom
          ? currentTileSize * skipFactor
          : currentTileSize;

        // Draw the tile
        offCtx.fillStyle = tile.color;
        offCtx.fillRect(screenX, screenY, renderSize, renderSize);

        // Draw grid if needed
        if (debug && camera.zoom >= GRID_VISIBLE_THRESHOLD && !isLowZoom) {
          offCtx.strokeStyle = "rgba(0,0,0,0.2)";
          offCtx.strokeRect(screenX, screenY, renderSize, renderSize);
        }

        // Draw coordinates if needed
        if (debug && camera.zoom >= COORDS_VISIBLE_THRESHOLD && !isLowZoom) {
          offCtx.fillStyle = "rgba(255,255,255,0.5)";
          offCtx.font = `${Math.max(8, currentTileSize / 3)}px sans-serif`;
          offCtx.textAlign = "center";
          offCtx.fillText(
            `${x},${y}`,
            screenX + renderSize / 2,
            screenY + renderSize / 2
          );
        }
      }
    }

    // Draw hovered tile highlight if any
    if (hoveredTile && camera.zoom > 0.2) {
      const { x, y } = hoveredTile;
      const screenX =
        (x - startX) * currentTileSize - offsetX + dimensions.width / 2;
      const screenY =
        (y - startY) * currentTileSize - offsetY + dimensions.height / 2;

      offCtx.strokeStyle = "rgba(255,255,255,0.8)";
      offCtx.lineWidth = 2;
      offCtx.strokeRect(screenX, screenY, currentTileSize, currentTileSize);
    }

    // Copy offscreen canvas to visible canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(offscreenCanvas, 0, 0);

    // Update debug info
    if (debug && hoveredTile) {
      const { x, y } = hoveredTile;
      if (x >= 0 && y >= 0 && x < WORLD_GRID_WIDTH && y < WORLD_GRID_HEIGHT) {
        const tile = worldData[y][x];
        setDebugInfo(
          `Tile: (${x}, ${y}) | Biome: ${BiomeType[tile.biomeType]} | ` +
            `Elev: ${tile.elevation.toFixed(3)} | ` +
            `Moist: ${tile.moisture.toFixed(3)} | ` +
            `Temp: ${tile.temperature.toFixed(3)} | ` +
            `Zoom: ${camera.zoom.toFixed(2)}`
        );
      }
    }

    // Reset render flag
    setNeedsRender(false);
  };

  // Initialize offscreen canvas
  useEffect(() => {
    offscreenCanvasRef.current = document.createElement("canvas");
    offscreenCanvasRef.current.width = dimensions.width;
    offscreenCanvasRef.current.height = dimensions.height;

    // Generate initial world
    generateWorld();

    // Initial resize to make sure canvas fits container
    handleResize();
  }, []);

  // Handle resize (moved outside useEffect for reuse)
  const handleResize = () => {
    if (canvasRef.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = rect.width;
      const newHeight = rect.height;

      // Update canvas dimensions
      canvasRef.current.width = newWidth;
      canvasRef.current.height = newHeight;

      // Update offscreen canvas dimensions
      if (offscreenCanvasRef.current) {
        offscreenCanvasRef.current.width = newWidth;
        offscreenCanvasRef.current.height = newHeight;
      }

      // Update dimensions state
      setDimensions({
        width: newWidth,
        height: newHeight,
      });

      setNeedsRender(true);
    }
  };

  // Update canvas size when container changes
  useEffect(() => {
    window.addEventListener("resize", handleResize);

    // Initial call to set proper dimensions
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Set up event handlers for map interaction
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    // Mouse event handlers
    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      canvas.style.cursor = "grabbing";
    };

    const handleMouseUp = () => {
      isDragging = false;
      canvas.style.cursor = "grab";
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update hovered tile
      const currentTileSize = getCurrentTileSize();
      const tileX = Math.floor(
        camera.x + (x - dimensions.width / 2) / currentTileSize
      );
      const tileY = Math.floor(
        camera.y + (y - dimensions.height / 2) / currentTileSize
      );

      if (!hoveredTile || hoveredTile.x !== tileX || hoveredTile.y !== tileY) {
        setHoveredTile({ x: tileX, y: tileY });
        setNeedsRender(true);
      }

      // Handle dragging
      if (isDragging) {
        const dx = (e.clientX - lastMouseX) / currentTileSize;
        const dy = (e.clientY - lastMouseY) / currentTileSize;

        setCamera((prev) => ({
          ...prev,
          x: Math.max(0, Math.min(WORLD_GRID_WIDTH, prev.x - dx)),
          y: Math.max(0, Math.min(WORLD_GRID_HEIGHT, prev.y - dy)),
        }));

        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        setNeedsRender(true);
      }
    };

    // Wheel event handler for zooming
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const zoomFactor = 1 - Math.sign(e.deltaY) * 0.1;
      const newZoom = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, camera.zoom * zoomFactor)
      );

      if (newZoom !== camera.zoom) {
        setCamera((prev) => ({ ...prev, zoom: newZoom }));
        setNeedsRender(true);
      }
    };

    // Add event listeners
    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    // Set initial cursor
    canvas.style.cursor = "grab";

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [camera, hoveredTile, dimensions]);

  // Render the map when needed
  useEffect(() => {
    if (needsRender && !isGenerating && worldData.length > 0) {
      renderMap();
    }
  }, [needsRender, isGenerating, worldData, camera, dimensions]);

  // Update world generation if parameters change
  useEffect(() => {
    generateWorld();
  }, [
    seed,
    noiseDetail,
    noiseFalloff,
    elevationOctaves,
    moistureOctaves,
    elevationScale,
    moistureScale,
    elevationPersistence,
    moisturePersistence,
    visualizationMode,
    biomeWeights,
  ]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black rounded-lg overflow-hidden"
    >
      {isGenerating && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
          <div className="text-white text-lg">Generating world...</div>
        </div>
      )}
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      {debug && (
        <div className="absolute bottom-2 left-2 p-2 bg-black bg-opacity-70 text-white text-xs font-mono rounded z-10">
          {debugInfo}
        </div>
      )}
    </div>
  );
};

export default WorldMap;
