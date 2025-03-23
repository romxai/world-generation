// WorldMap.tsx - Main component for rendering the procedurally generated world map
"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import {
  WINDOW_WIDTH,
  WINDOW_HEIGHT,
  DEFAULT_TILE_SIZE,
  DEFAULT_SEED,
  NOISE_DETAIL,
  NOISE_FALLOFF,
  INITIAL_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM,
  CAMERA_SPEED,
  INITIAL_OFFSET_X,
  INITIAL_OFFSET_Y,
  DEBUG_MODE,
  SHOW_GRID,
  SHOW_COORDS,
  WORLD_GRID_WIDTH,
  WORLD_GRID_HEIGHT,
  GRID_VISIBLE_THRESHOLD,
  COORDS_VISIBLE_THRESHOLD,
  TerrainType,
  BIOME_PRESETS,
  VisualizationMode,
  calculateTerrainHeights,
  LOW_ZOOM_THRESHOLD,
  LOW_ZOOM_TILE_FACTOR,
} from "./config";
import { PerlinNoise, createNoiseGenerator } from "./noiseGenerator";
import {
  RGB,
  Tile,
  generateTileGrid,
  rgbToString,
  getTileEdgeType,
  getTerrainTypeForHeight,
  getTerrainColor,
} from "./terrainUtils";

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
}

interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

const WorldMap: React.FC<WorldMapProps> = ({
  width = WINDOW_WIDTH,
  height = WINDOW_HEIGHT,
  tileSize = DEFAULT_TILE_SIZE,
  seed = DEFAULT_SEED,
  debug = DEBUG_MODE,
  biomeWeights = BIOME_PRESETS.CONTINENTS,
  noiseDetail = NOISE_DETAIL,
  noiseFalloff = NOISE_FALLOFF,
  visualizationMode = VisualizationMode.BIOME,
}) => {
  // Canvas and rendering references
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Camera state for position and zoom
  const [camera, setCamera] = useState<CameraState>({
    x: INITIAL_OFFSET_X,
    y: INITIAL_OFFSET_Y,
    zoom: INITIAL_ZOOM,
  });

  // Tracking state
  const [mapChanged, setMapChanged] = useState<boolean>(true);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  // Cache the terrain heights calculated from weights
  // This improves performance by not recalculating on every render
  const terrainHeights = useMemo(() => {
    return calculateTerrainHeights(biomeWeights);
  }, [biomeWeights]);

  // Create noise generator with specified seed
  const noiseGeneratorRef = useRef<PerlinNoise>(
    createNoiseGenerator(seed, noiseDetail, noiseFalloff)
  );

  // When seed, detail or falloff changes, update the noise generator
  useEffect(() => {
    noiseGeneratorRef.current = createNoiseGenerator(
      seed,
      noiseDetail,
      noiseFalloff
    );
    setMapChanged(true);
  }, [seed, noiseDetail, noiseFalloff]);

  // Re-render map when visualization mode or biome weights change
  useEffect(() => {
    setMapChanged(true);
  }, [visualizationMode, biomeWeights]);

  // Key states for camera movement
  const keyStates = useRef<{ [key: string]: boolean }>({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  });

  // Setup offscreen canvas for rendering
  useEffect(() => {
    offscreenCanvasRef.current = document.createElement("canvas");
    offscreenCanvasRef.current.width = width;
    offscreenCanvasRef.current.height = height;
  }, [width, height]);

  // Handle keyboard events for camera movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (Object.keys(keyStates.current).includes(e.key)) {
        keyStates.current[e.key] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (Object.keys(keyStates.current).includes(e.key)) {
        keyStates.current[e.key] = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Calculate tile size based on zoom level
  const calculateTileSize = (zoom: number): number => {
    return tileSize * zoom;
  };

  // Calculate which grid cells are visible in the current view
  const getVisibleGridCells = (
    camera: CameraState,
    zoom: number,
    isLowZoom: boolean
  ): {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    skipFactor: number;
  } => {
    // Calculate actual tile size with zoom applied
    const currentTileSize = calculateTileSize(zoom);

    // Determine skip factor for low zoom levels
    // This reduces the number of tiles rendered at low zoom levels
    const skipFactor = isLowZoom ? LOW_ZOOM_TILE_FACTOR : 1;

    // Adjust for skip factor when calculating how many tiles to render
    const tilesX = Math.ceil(width / currentTileSize) + 1; // +1 to handle partial tiles
    const tilesY = Math.ceil(height / currentTileSize) + 1;

    // Calculate the starting tile based on camera position
    // Camera position is center of view, so offset by half the visible tiles
    // We need to adjust for the skip factor to ensure we get the right starting point
    const startX = Math.max(
      0,
      Math.floor((camera.x - tilesX / 2) / skipFactor) * skipFactor
    );
    const startY = Math.max(
      0,
      Math.floor((camera.y - tilesY / 2) / skipFactor) * skipFactor
    );

    // Calculate the ending tile, clamped to world boundaries
    const endX = Math.min(WORLD_GRID_WIDTH - 1, startX + tilesX * skipFactor);
    const endY = Math.min(WORLD_GRID_HEIGHT - 1, startY + tilesY * skipFactor);

    return { startX, startY, endX, endY, skipFactor };
  };

  // Animation loop for camera movement and rendering
  useEffect(() => {
    let animationFrameId: number;

    const updateCamera = () => {
      let changed = false;

      // Calculate movement speed based on zoom level
      // Slower movement when zoomed in, faster when zoomed out
      const moveSpeed = CAMERA_SPEED / camera.zoom;

      setCamera((prevCamera) => {
        let newX = prevCamera.x;
        let newY = prevCamera.y;

        // Handle arrow key movement
        if (keyStates.current.ArrowRight) {
          newX = Math.min(WORLD_GRID_WIDTH - 1, newX + moveSpeed);
          changed = true;
        }

        if (keyStates.current.ArrowLeft) {
          newX = Math.max(0, newX - moveSpeed);
          changed = true;
        }

        if (keyStates.current.ArrowUp) {
          newY = Math.max(0, newY - moveSpeed);
          changed = true;
        }

        if (keyStates.current.ArrowDown) {
          newY = Math.min(WORLD_GRID_HEIGHT - 1, newY + moveSpeed);
          changed = true;
        }

        // Only update if there was a change
        if (changed) {
          return { ...prevCamera, x: newX, y: newY };
        }
        return prevCamera;
      });

      if (changed) {
        setMapChanged(true);
      }

      animationFrameId = requestAnimationFrame(updateCamera);
    };

    updateCamera();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [camera.zoom]);

  // Handle mouse wheel for zooming
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      setCamera((prevCamera) => {
        // Get mouse position relative to canvas
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return prevCamera;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Convert mouse position to world coordinates before zoom
        const worldX =
          prevCamera.x + (mouseX - width / 2) / (tileSize * prevCamera.zoom);
        const worldY =
          prevCamera.y + (mouseY - height / 2) / (tileSize * prevCamera.zoom);

        // Calculate new zoom level
        const zoomDelta = e.deltaY * -0.001;
        const newZoom = Math.max(
          MIN_ZOOM,
          Math.min(MAX_ZOOM, prevCamera.zoom + zoomDelta * prevCamera.zoom)
        );

        // Calculate new camera position to zoom towards mouse position
        // This creates the effect of zooming into where the mouse is pointing
        let newX = worldX - (mouseX - width / 2) / (tileSize * newZoom);
        let newY = worldY - (mouseY - height / 2) / (tileSize * newZoom);

        // Clamp camera position to world boundaries
        newX = Math.max(0, Math.min(WORLD_GRID_WIDTH - 1, newX));
        newY = Math.max(0, Math.min(WORLD_GRID_HEIGHT - 1, newY));

        // Only update if zoom actually changed
        if (newZoom !== prevCamera.zoom) {
          setMapChanged(true);
          return { x: newX, y: newY, zoom: newZoom };
        }

        return prevCamera;
      });
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("wheel", handleWheel);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener("wheel", handleWheel);
      }
    };
  }, [width, height, tileSize]);

  // Track mouse movement for debug info
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePos({ x, y });

        // Set map changed to true to update debug info
        // Only if debug mode is on to avoid unnecessary redraws
        if (debug) {
          setMapChanged(true);
        }
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [debug]);

  // Get color based on the current visualization mode
  const getVisualizationColor = (
    noiseValue: number,
    terrainType: TerrainType
  ): RGB => {
    switch (visualizationMode) {
      case VisualizationMode.NOISE:
        // Display raw noise values as grayscale
        const val = Math.round(noiseValue * 255);
        return { r: val, g: val, b: val };

      case VisualizationMode.ELEVATION:
        // Display elevation using a gradient from blue (low) to white (high)
        return {
          r: Math.round(40 + noiseValue * 215),
          g: Math.round(80 + noiseValue * 175),
          b: Math.round(120 + noiseValue * 135),
        };

      case VisualizationMode.WEIGHT_DISTRIBUTION:
        // Show how weights affect terrain distribution
        // Each terrain type gets a distinct color
        const colors = [
          { r: 30, g: 144, b: 255 }, // Ocean Deep: DodgerBlue
          { r: 135, g: 206, b: 250 }, // Ocean Medium: LightSkyBlue
          { r: 0, g: 255, b: 255 }, // Ocean Shallow: Cyan
          { r: 255, g: 223, b: 0 }, // Beach: Gold
          { r: 124, g: 252, b: 0 }, // Grass: LawnGreen
          { r: 160, g: 82, b: 45 }, // Mountain: Sienna
          { r: 255, g: 250, b: 250 }, // Snow: Snow
        ];
        return colors[terrainType];

      case VisualizationMode.BIOME:
      default:
        // Default biome colors with interpolation
        return getTerrainColor(noiseValue, terrainType);
    }
  };

  // Main render function
  useEffect(() => {
    if (!mapChanged) return;

    const canvas = canvasRef.current;
    const offscreenCanvas = offscreenCanvasRef.current;

    if (!canvas || !offscreenCanvas) return;

    const ctx = canvas.getContext("2d");
    const offCtx = offscreenCanvas.getContext("2d");

    if (!ctx || !offCtx) return;

    // Check if we're at a low zoom level where optimization is needed
    const isLowZoom = camera.zoom < LOW_ZOOM_THRESHOLD;

    // Get current tile size based on zoom level
    const currentTileSize = calculateTileSize(camera.zoom);

    // Calculate visible grid cells with potential skip factor for low zoom
    const { startX, startY, endX, endY, skipFactor } = getVisibleGridCells(
      camera,
      camera.zoom,
      isLowZoom
    );

    // Calculate pixel offset for rendering (to handle partial tiles)
    const offsetX = (camera.x - startX) * currentTileSize;
    const offsetY = (camera.y - startY) * currentTileSize;

    // Clear offscreen canvas
    offCtx.clearRect(0, 0, width, height);

    // Create a function to get noise value for a specific world position
    const getNoise = (worldX: number, worldY: number) => {
      // Scale coordinates to ensure landscape features have appropriate sizes
      // Dividing by a larger number creates larger continents/islands
      const noiseX = worldX / 100;
      const noiseY = worldY / 100;
      return noiseGeneratorRef.current.get(noiseX, noiseY);
    };

    // Generate only the visible tiles (lazy loading)
    // We only generate tiles that are actually visible in the viewport
    for (let worldY = startY; worldY <= endY; worldY += skipFactor) {
      for (let worldX = startX; worldX <= endX; worldX += skipFactor) {
        // Get the noise value for this world position
        const noiseValue = getNoise(worldX, worldY);

        // Determine terrain type based on noise value and terrain heights from weights
        const terrainType = getTerrainTypeForHeight(noiseValue, terrainHeights);

        // Get appropriate color based on visualization mode
        const color = getVisualizationColor(noiseValue, terrainType);

        // Calculate screen position for this tile
        const screenX =
          (worldX - startX) * currentTileSize - offsetX + width / 2;
        const screenY =
          (worldY - startY) * currentTileSize - offsetY + height / 2;

        // For low zoom levels, we draw larger tiles to improve performance
        const renderSize = isLowZoom
          ? currentTileSize * skipFactor
          : currentTileSize;

        // Draw the tile with the calculated color
        offCtx.fillStyle = rgbToString(color);
        offCtx.fillRect(screenX, screenY, renderSize, renderSize);

        // Draw grid lines if enabled and zoom level is high enough
        if (
          debug &&
          SHOW_GRID &&
          camera.zoom >= GRID_VISIBLE_THRESHOLD &&
          !isLowZoom
        ) {
          offCtx.strokeStyle = "rgba(0, 0, 0, 0.2)";
          offCtx.strokeRect(screenX, screenY, renderSize, renderSize);
        }

        // Show coordinates in debug mode when zoomed in far enough
        if (
          debug &&
          SHOW_COORDS &&
          camera.zoom >= COORDS_VISIBLE_THRESHOLD &&
          !isLowZoom
        ) {
          offCtx.fillStyle = "rgba(0, 0, 0, 0.5)";
          offCtx.font = `${Math.max(8, currentTileSize / 4)}px Arial`;
          offCtx.fillText(
            `${worldX},${worldY}`,
            screenX + 2,
            screenY + Math.max(8, currentTileSize / 4)
          );
        }
      }
    }

    // Additional visualization mode overlay indicators
    if (visualizationMode !== VisualizationMode.BIOME) {
      offCtx.fillStyle = "rgba(0, 0, 0, 0.7)";
      offCtx.font = "14px Arial";
      offCtx.fillText(
        `Visualization Mode: ${visualizationMode.toUpperCase()}`,
        10,
        30
      );
    }

    // Copy from offscreen canvas to visible canvas
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(offscreenCanvas, 0, 0);

    // Update debug info if enabled
    if (debug) {
      // Calculate the world position of the mouse
      const mouseWorldX =
        startX + (mousePos.x - width / 2 + offsetX) / currentTileSize;
      const mouseWorldY =
        startY + (mousePos.y - height / 2 + offsetY) / currentTileSize;

      // Round to get the tile coordinates
      const tileX = Math.floor(mouseWorldX);
      const tileY = Math.floor(mouseWorldY);

      // Check if mouse is over a valid tile
      if (
        tileX >= 0 &&
        tileX < WORLD_GRID_WIDTH &&
        tileY >= 0 &&
        tileY < WORLD_GRID_HEIGHT
      ) {
        // Get the noise value for this tile
        const noiseValue = getNoise(tileX, tileY);

        // Get the terrain type
        const terrainType = getTerrainTypeForHeight(noiseValue, terrainHeights);

        // Update debug info
        setDebugInfo(
          `Tile: (${tileX}, ${tileY}) | ` +
            `Noise: ${noiseValue.toFixed(3)} | ` +
            `Terrain: ${TerrainType[terrainType]} | ` +
            `Zoom: ${camera.zoom.toFixed(2)} | ` +
            `View: ${isLowZoom ? "Low-res" : "Full-res"} | ` +
            `Skip: ${skipFactor} | ` +
            `Camera: (${camera.x.toFixed(1)}, ${camera.y.toFixed(1)})`
        );
      }
    }

    setMapChanged(false);
  }, [
    mapChanged,
    width,
    height,
    tileSize,
    camera,
    debug,
    mousePos,
    visualizationMode,
    terrainHeights,
  ]);

  return (
    <div className="world-map-container" style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          border: "1px solid #000",
          backgroundColor: "#333",
        }}
      />
      {debug && (
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "10px",
            background: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "5px",
            fontFamily: "monospace",
            fontSize: "12px",
          }}
        >
          {debugInfo}
        </div>
      )}
    </div>
  );
};

export default WorldMap;
