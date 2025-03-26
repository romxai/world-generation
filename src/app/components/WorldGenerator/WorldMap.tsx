// WorldMap.tsx - Main component for rendering the procedurally generated world map
"use client";

import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
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
  BiomeType,
  VisualizationMode,
  LOW_ZOOM_THRESHOLD,
  LOW_ZOOM_TILE_FACTOR,
  DEFAULT_OCTAVES,
  DEFAULT_ELEVATION_SCALE,
  DEFAULT_MOISTURE_SCALE,
  DEFAULT_OCTAVE_WEIGHT,
  BIOME_NAMES,
  DEFAULT_EQUATOR_POSITION,
  DEFAULT_TEMPERATURE_VARIANCE,
  DEFAULT_ELEVATION_TEMP_EFFECT,
  DEFAULT_TEMPERATURE_BAND_SCALE,
  DEFAULT_TEMPERATURE_PARAMS,
  RGB,
  MOISTURE_THRESHOLDS,
  TEMPERATURE_THRESHOLDS,
} from "./config";
import { WorldGenerator, WorldGeneratorConfig } from "./worldGenerator";
import { rgbToString } from "./terrainUtils";
import ProgressBar from "./UI/ProgressBar";
import NavigationControls from "./UI/NavigationControls";
import TileInfoPanel from "./UI/TileInfoPanel";

// Define the ContinentalFalloffParams interface
export interface ContinentalFalloffParams {
  enabled: boolean;
  falloffRate: number;
  centerX: number;
  centerY: number;
}

// Define default continental falloff parameters
export const DEFAULT_CONTINENTAL_PARAMS: ContinentalFalloffParams = {
  enabled: false,
  falloffRate: 0.8,
  centerX: 0.5,
  centerY: 0.5,
};

interface WorldMapProps {
  width?: number;
  height?: number;
  tileSize?: number;
  seed?: number;
  debug?: boolean;
  noiseDetail?: number;
  noiseFalloff?: number;
  visualizationMode?: VisualizationMode;
  // New properties for advanced generation
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
    // New temperature parameters
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
  // Continental falloff parameters
  continentalFalloffParams?: ContinentalFalloffParams;
  // Add threshold parameters
  moistureThresholds?: typeof MOISTURE_THRESHOLDS;
  temperatureThresholds?: typeof TEMPERATURE_THRESHOLDS;
  // Progress tracking
  isGenerating?: boolean;
  generationProgress?: number;
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
  noiseDetail = NOISE_DETAIL,
  noiseFalloff = NOISE_FALLOFF,
  visualizationMode = VisualizationMode.BIOME,
  // New properties with defaults
  elevationOctaves = DEFAULT_OCTAVES,
  moistureOctaves = DEFAULT_OCTAVES,
  elevationScale = DEFAULT_ELEVATION_SCALE,
  moistureScale = DEFAULT_MOISTURE_SCALE,
  elevationPersistence = DEFAULT_OCTAVE_WEIGHT,
  moisturePersistence = DEFAULT_OCTAVE_WEIGHT,
  // Temperature parameters
  temperatureParams = {
    equatorPosition: DEFAULT_EQUATOR_POSITION,
    temperatureVariance: DEFAULT_TEMPERATURE_VARIANCE,
    elevationEffect: DEFAULT_ELEVATION_TEMP_EFFECT,
    bandScale: DEFAULT_TEMPERATURE_BAND_SCALE,
    // Add new temperature parameter defaults
    noiseScale: DEFAULT_TEMPERATURE_PARAMS.noiseScale,
    noiseOctaves: DEFAULT_TEMPERATURE_PARAMS.noiseOctaves,
    noisePersistence: DEFAULT_TEMPERATURE_PARAMS.noisePersistence,
    polarTemperature: DEFAULT_TEMPERATURE_PARAMS.polarTemperature,
    equatorTemperature: DEFAULT_TEMPERATURE_PARAMS.equatorTemperature,
  },
  // Radial gradient parameters for ocean effect
  radialGradientParams = {
    centerX: 0.5,
    centerY: 0.5,
    radius: 0.5,
    falloffExponent: 2.0,
    strength: 0.5,
  },
  // Continental falloff parameters
  continentalFalloffParams = DEFAULT_CONTINENTAL_PARAMS,
  // Add threshold parameters with defaults
  moistureThresholds = MOISTURE_THRESHOLDS,
  temperatureThresholds = TEMPERATURE_THRESHOLDS,
  // Progress tracking
  isGenerating = false,
  generationProgress = 0,
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

  // Visualization state
  const [currentVisualizationMode, setVisualizationMode] =
    useState<string>(visualizationMode);

  // Tracking state for tile information
  const [hoverTileInfo, setHoverTileInfo] = useState<string | null>(null);
  const [hoverTileCoords, setHoverTileCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectedTileInfo, setSelectedTileInfo] = useState<string | null>(null);
  const [selectedTileCoords, setSelectedTileCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Create world generator with specified parameters
  const worldGeneratorRef = useRef<WorldGenerator>(
    new WorldGenerator({
      seed,
      elevationOctaves,
      moistureOctaves,
      elevationScale,
      moistureScale,
      elevationPersistence,
      moisturePersistence,
      temperatureParams: {
        equatorPosition: temperatureParams.equatorPosition,
        temperatureVariance: temperatureParams.temperatureVariance,
        elevationEffect: temperatureParams.elevationEffect,
        polarTemperature: temperatureParams.polarTemperature || 0.0,
        equatorTemperature: temperatureParams.equatorTemperature || 1.0,
        bandScale: temperatureParams.bandScale,
        noiseScale: temperatureParams.noiseScale,
        noiseOctaves: temperatureParams.noiseOctaves,
        noisePersistence: temperatureParams.noisePersistence,
        noiseSeed: temperatureParams.noiseSeed || seed + 2000,
      },
      radialGradientParams,
      moistureThresholds,
      temperatureThresholds,
    })
  );

  // Key states for camera movement
  const keyStates = useRef<{ [key: string]: boolean }>({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  });

  // Handle pan action from navigation buttons - defined BEFORE the keyboard useEffect
  const handlePan = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      // Determine camera movement speed based on zoom level
      const speed = CAMERA_SPEED / camera.zoom;

      let newX = camera.x;
      let newY = camera.y;

      switch (direction) {
        case "up":
          newY -= speed;
          break;
        case "down":
          newY += speed;
          break;
        case "left":
          newX -= speed;
          break;
        case "right":
          newX += speed;
          break;
      }

      // Clamp camera position to world boundaries
      newX = Math.max(0, Math.min(WORLD_GRID_WIDTH, newX));
      newY = Math.max(0, Math.min(WORLD_GRID_HEIGHT, newY));

      setCamera((prevCamera) => ({ ...prevCamera, x: newX, y: newY }));
      setMapChanged(true);
    },
    [camera.zoom, camera.x, camera.y]
  );

  // Handle zoom action from zoom buttons
  const handleZoom = useCallback(
    (zoomIn: boolean) => {
      const zoomFactor = zoomIn ? 1.2 : 0.8;
      let newZoom = camera.zoom * zoomFactor;

      // Clamp zoom to defined min/max range
      newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));

      if (newZoom !== camera.zoom) {
        setCamera((prevCamera) => ({ ...prevCamera, zoom: newZoom }));
        setMapChanged(true);
      }
    },
    [camera.zoom]
  );

  // Handle keyboard events for camera movement - now defined AFTER handlePan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (Object.keys(keyStates.current).includes(e.key)) {
        keyStates.current[e.key] = true;
        // Trigger rendering update when a key is pressed
        setMapChanged(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (Object.keys(keyStates.current).includes(e.key)) {
        keyStates.current[e.key] = false;
      }
    };

    // Process keyboard input for camera movement
    const updateCameraFromKeyboard = () => {
      // Convert keyboard input to direction
      if (keyStates.current.ArrowUp) handlePan("up");
      if (keyStates.current.ArrowDown) handlePan("down");
      if (keyStates.current.ArrowLeft) handlePan("left");
      if (keyStates.current.ArrowRight) handlePan("right");

      // Request next frame update if any key is pressed
      if (Object.values(keyStates.current).some((value) => value)) {
        requestAnimationFrame(updateCameraFromKeyboard);
      }
    };

    // Start animation loop if any key is pressed
    const checkKeyboardInput = () => {
      if (Object.values(keyStates.current).some((value) => value)) {
        updateCameraFromKeyboard();
      }

      // Continue checking for keyboard input
      animationFrameId = requestAnimationFrame(checkKeyboardInput);
    };

    // Start the keyboard check loop
    let animationFrameId = requestAnimationFrame(checkKeyboardInput);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [handlePan]); // handlePan is now defined before this useEffect

  // When generation parameters change, update the world generator
  useEffect(() => {
    worldGeneratorRef.current.updateConfig({
      seed,
      elevationOctaves,
      moistureOctaves,
      elevationScale,
      moistureScale,
      elevationPersistence,
      moisturePersistence,
      temperatureParams,
      radialGradientParams,
      moistureThresholds,
      temperatureThresholds,
    });
    setMapChanged(true);
  }, [
    seed,
    elevationOctaves,
    moistureOctaves,
    elevationScale,
    moistureScale,
    elevationPersistence,
    moisturePersistence,
    temperatureParams,
    radialGradientParams,
    moistureThresholds,
    temperatureThresholds,
  ]);

  // Re-render map when visualization mode or biome weights change
  useEffect(() => {
    setMapChanged(true);
    setVisualizationMode(visualizationMode);
  }, [visualizationMode]);

  // Setup offscreen canvas for rendering
  useEffect(() => {
    offscreenCanvasRef.current = document.createElement("canvas");
    offscreenCanvasRef.current.width = width;
    offscreenCanvasRef.current.height = height;
  }, [width, height]);

  // Calculate tile size based on zoom level
  const calculateTileSize = useCallback(
    (zoom: number): number => {
      return tileSize * zoom;
    },
    [tileSize]
  );

  // Calculate which grid cells are visible in the current view
  const getVisibleGridCells = useCallback(
    (
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
      const endY = Math.min(
        WORLD_GRID_HEIGHT - 1,
        startY + tilesY * skipFactor
      );

      return { startX, startY, endX, endY, skipFactor };
    },
    [calculateTileSize, width, height]
  );

  // Main rendering loop - updates the canvas when needed
  useEffect(() => {
    // Skip rendering if nothing changed
    if (!mapChanged) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const offscreenCanvas = offscreenCanvasRef.current;
    if (!offscreenCanvas) return;

    const offCtx = offscreenCanvas.getContext("2d");
    if (!offCtx) return;

    // Clear the canvas
    offCtx.clearRect(0, 0, width, height);

    // Calculate which grid cells are visible
    const isLowZoom = camera.zoom < LOW_ZOOM_THRESHOLD;
    const { startX, startY, endX, endY, skipFactor } = getVisibleGridCells(
      camera,
      camera.zoom,
      isLowZoom
    );

    // Calculate actual tile size with zoom
    const currentTileSize = calculateTileSize(camera.zoom);

    // Calculate camera offset in pixels
    const offsetX = (camera.x - startX) * currentTileSize;
    const offsetY = (camera.y - startY) * currentTileSize;

    // Generate only the visible tiles (lazy loading)
    // We only generate tiles that are actually visible in the viewport
    for (let worldY = startY; worldY <= endY; worldY += skipFactor) {
      for (let worldX = startX; worldX <= endX; worldX += skipFactor) {
        // Get color for this tile based on visualization mode
        const color = worldGeneratorRef.current.getColorForMode(
          worldX,
          worldY,
          currentVisualizationMode as VisualizationMode
        );

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
    if (currentVisualizationMode !== VisualizationMode.BIOME) {
      offCtx.fillStyle = "rgba(0, 0, 0, 0.7)";
      offCtx.font = "14px Arial";
      offCtx.fillText(
        `Visualization Mode: ${currentVisualizationMode.toUpperCase()}`,
        10,
        30
      );
    }

    // Copy from offscreen canvas to visible canvas
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(offscreenCanvas, 0, 0);

    // Rendering complete, reset the change flag
    setMapChanged(false);
  }, [
    mapChanged,
    width,
    height,
    tileSize,
    camera,
    debug,
    currentVisualizationMode,
  ]);

  // Get world coordinates from screen coordinates
  const screenToWorldCoords = useCallback(
    (screenX: number, screenY: number) => {
      if (!canvasRef.current) return null;

      const rect = canvasRef.current.getBoundingClientRect();
      const canvasX = screenX - rect.left;
      const canvasY = screenY - rect.top;

      // Calculate actual tile size with zoom
      const currentTileSize = calculateTileSize(camera.zoom);

      // Get visible grid cells to determine start coordinates
      const isLowZoom = camera.zoom < LOW_ZOOM_THRESHOLD;
      const { startX, startY } = getVisibleGridCells(
        camera,
        camera.zoom,
        isLowZoom
      );

      // Calculate camera offset in pixels
      const offsetX = (camera.x - startX) * currentTileSize;
      const offsetY = (camera.y - startY) * currentTileSize;

      // Convert screen coordinates to world coordinates
      const mouseWorldX =
        startX + (canvasX - width / 2 + offsetX) / currentTileSize;
      const mouseWorldY =
        startY + (canvasY - height / 2 + offsetY) / currentTileSize;

      // Round to get the tile coordinates
      const tileX = Math.floor(mouseWorldX);
      const tileY = Math.floor(mouseWorldY);

      // Check if mouse is over a valid tile
      if (
        tileX < 0 ||
        tileX >= WORLD_GRID_WIDTH ||
        tileY < 0 ||
        tileY >= WORLD_GRID_HEIGHT
      ) {
        return null;
      }

      return { x: tileX, y: tileY };
    },
    [camera, tileSize, width, height, calculateTileSize, getVisibleGridCells]
  );

  // Handle mouse movement to show hover tile info
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const coords = screenToWorldCoords(e.clientX, e.clientY);
      if (!coords) {
        setHoverTileInfo(null);
        setHoverTileCoords(null);
        return;
      }

      const { x, y } = coords;
      setHoverTileCoords({ x, y });

      // Get detailed info for this tile
      const tileInfo = worldGeneratorRef.current.getDebugInfo(x, y);
      setHoverTileInfo(tileInfo);
    },
    [screenToWorldCoords]
  );

  // Handle mouse click to select a tile
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const coords = screenToWorldCoords(e.clientX, e.clientY);
      if (!coords) {
        return;
      }

      const { x, y } = coords;
      setSelectedTileCoords({ x, y });

      // Get detailed info for this tile
      const tileInfo = worldGeneratorRef.current.getDebugInfo(x, y);
      setSelectedTileInfo(tileInfo);
    },
    [screenToWorldCoords]
  );

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      />

      {debug && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 p-2 rounded text-white text-xs">
          <div>Seed: {seed}</div>
          <div>Zoom: {camera.zoom.toFixed(2)}</div>
        </div>
      )}

      {/* Hover tile info panel */}
      {hoverTileInfo && hoverTileCoords && (
        <TileInfoPanel
          tileInfo={hoverTileInfo}
          position="hover"
          coordinates={hoverTileCoords}
        />
      )}

      {/* Selected tile info panel */}
      {selectedTileInfo && selectedTileCoords && (
        <TileInfoPanel
          tileInfo={selectedTileInfo}
          position="selected"
          coordinates={selectedTileCoords}
        />
      )}

      {/* Navigation controls */}
      <NavigationControls onPan={handlePan} onZoom={handleZoom} />

      {/* Progress bar overlay */}
      {isGenerating && <ProgressBar progress={generationProgress} />}
    </div>
  );
};

export default WorldMap;
