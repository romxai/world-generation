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

    // Update camera position based on keyboard input
    const updateCamera = () => {
      let newX = camera.x;
      let newY = camera.y;

      // Determine camera movement speed based on zoom level
      // Moving faster when zoomed out makes navigation more efficient
      const speed = CAMERA_SPEED / camera.zoom;

      // Apply movement based on which keys are pressed
      if (keyStates.current.ArrowUp) newY -= speed;
      if (keyStates.current.ArrowDown) newY += speed;
      if (keyStates.current.ArrowLeft) newX -= speed;
      if (keyStates.current.ArrowRight) newX += speed;

      // Clamp camera position to world boundaries
      newX = Math.max(0, Math.min(WORLD_GRID_WIDTH, newX));
      newY = Math.max(0, Math.min(WORLD_GRID_HEIGHT, newY));

      // Only update if position changed
      if (newX !== camera.x || newY !== camera.y) {
        setCamera((prevCamera) => ({ ...prevCamera, x: newX, y: newY }));
        setMapChanged(true);
      }
    };

    // Set up animation loop for smooth camera movement
    const handleCameraMovement = () => {
      updateCamera();
      animationFrameRef.current = requestAnimationFrame(handleCameraMovement);
    };

    // Start animation loop and clean up on unmount
    const animationFrameRef = { current: 0 };
    animationFrameRef.current = requestAnimationFrame(handleCameraMovement);

    // Handle mouse wheel for zooming
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Calculate zoom factor based on wheel delta
      const zoomFactor = 1 - Math.sign(e.deltaY) * 0.1;
      let newZoom = camera.zoom * zoomFactor;

      // Clamp zoom to defined min/max range
      newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));

      if (newZoom !== camera.zoom) {
        setCamera((prevCamera) => ({ ...prevCamera, zoom: newZoom }));
        setMapChanged(true);
      }
    };

    // Add wheel event listener
    canvas.addEventListener("wheel", handleWheel);

    // Handle mouse movement for position tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    // Add mouse move event listener
    canvas.addEventListener("mousemove", handleMouseMove);

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
        // Get detailed debug info for this tile
        const debugTileInfo = worldGeneratorRef.current.getDebugInfo(
          tileX,
          tileY
        );
        setDebugInfo(debugTileInfo);
      }
    }

    // Clean up event listeners
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [
    mapChanged,
    width,
    height,
    tileSize,
    camera,
    debug,
    mousePos,
    currentVisualizationMode,
  ]);

  // Function to get debug information
  const handleMouseMoveDebug = useCallback(
    (e: MouseEvent) => {
      if (!canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate the effective tile size based on zoom
      const effectiveTileSize = tileSize * camera.zoom;

      // Convert screen coordinates to world coordinates
      const worldX = Math.floor(
        camera.x + (mouseX - width / 2) / effectiveTileSize
      );
      const worldY = Math.floor(
        camera.y + (mouseY - height / 2) / effectiveTileSize
      );

      // Set mouse position for debug display
      setMousePos({ x: worldX, y: worldY });

      // Get debug info
      if (
        worldX >= 0 &&
        worldX < WORLD_GRID_WIDTH &&
        worldY >= 0 &&
        worldY < WORLD_GRID_HEIGHT
      ) {
        const debugText = worldGeneratorRef.current.getDebugInfo(
          worldX,
          worldY
        );
        setDebugInfo(debugText);
      }
    },
    [camera, tileSize, width, height]
  );

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
            borderRadius: "3px",
            fontSize: "12px",
            fontFamily: "monospace",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {debugInfo}
        </div>
      )}
    </div>
  );
};

export default WorldMap;
