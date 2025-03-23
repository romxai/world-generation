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
  DEFAULT_OCTAVES,
  DEFAULT_ELEVATION_SCALE,
  DEFAULT_MOISTURE_SCALE,
  DEFAULT_OCTAVE_WEIGHT,
  BiomeType,
  BIOME_NAMES,
  DEFAULT_EQUATOR_POSITION,
  DEFAULT_TEMPERATURE_VARIANCE,
  DEFAULT_ELEVATION_TEMP_EFFECT,
} from "./config";
import { PerlinNoise, createNoiseGenerator } from "./noiseGenerator";
import { WorldGenerator, WorldGeneratorConfig } from "./worldGenerator";
import { RGB, rgbToString } from "./terrainUtils";

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
  // New properties for advanced generation
  elevationOctaves?: number;
  moistureOctaves?: number;
  elevationScale?: number;
  moistureScale?: number;
  elevationPersistence?: number;
  moisturePersistence?: number;
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
  biomeWeights = BIOME_PRESETS.ISLANDS,
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

  // Temperature parameters state
  const [equatorPosition, setEquatorPosition] = useState(
    DEFAULT_EQUATOR_POSITION
  );
  const [temperatureVariance, setTemperatureVariance] = useState(
    DEFAULT_TEMPERATURE_VARIANCE
  );
  const [elevationTempEffect, setElevationTempEffect] = useState(
    DEFAULT_ELEVATION_TEMP_EFFECT
  );

  // Visualization state
  const [currentVisualizationMode, setVisualizationMode] =
    useState<string>(visualizationMode);

  // Cache the terrain heights calculated from weights
  // This improves performance by not recalculating on every render
  const terrainHeights = useMemo(() => {
    return calculateTerrainHeights(biomeWeights);
  }, [biomeWeights]);

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
        equatorPosition,
        temperatureVariance,
        elevationEffect: elevationTempEffect,
        polarTemperature: 0.0,
        equatorTemperature: 1.0,
      },
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
      temperatureParams: {
        equatorPosition,
        temperatureVariance,
        elevationEffect: elevationTempEffect,
        polarTemperature: 0.0,
        equatorTemperature: 1.0,
      },
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
    equatorPosition,
    temperatureVariance,
    elevationTempEffect,
  ]);

  // Re-render map when visualization mode or biome weights change
  useEffect(() => {
    setMapChanged(true);
    setVisualizationMode(visualizationMode);
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
        const biomeData = worldGeneratorRef.current.getBiomeData(tileX, tileY);
        const biomeType = worldGeneratorRef.current.getBiome(tileX, tileY);

        // Update debug info
        setDebugInfo(
          `Tile: (${tileX}, ${tileY}) | ` +
            `Elev: ${biomeData.elevation.toFixed(3)} | ` +
            `Moist: ${biomeData.moisture.toFixed(3)} | ` +
            `Temp: ${biomeData.temperature.toFixed(3)} | ` +
            `Biome: ${BIOME_NAMES[biomeType]} | ` +
            `Zoom: ${camera.zoom.toFixed(2)} | ` +
            `View: ${isLowZoom ? "Low-res" : "Full-res"} | ` +
            `Skip: ${skipFactor} | ` +
            `Camera: (${camera.x.toFixed(1)}, ${camera.y.toFixed(1)})`
        );
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
            borderRadius: "3px",
            fontSize: "12px",
            fontFamily: "monospace",
            maxWidth: "80%",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {debugInfo}
        </div>
      )}

      <div
        className="controls"
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "rgba(0, 0, 0, 0.7)",
          color: "white",
          padding: "10px",
          borderRadius: "5px",
          width: "250px",
        }}
      >
        <h4 style={{ margin: "0 0 10px 0" }}>Temperature Controls</h4>

        <div style={{ marginBottom: "10px" }}>
          <label
            htmlFor="equatorPosition"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Equator Position: {equatorPosition.toFixed(2)}
          </label>
          <input
            id="equatorPosition"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={equatorPosition}
            onChange={(e) => setEquatorPosition(parseFloat(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label
            htmlFor="temperatureVariance"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Temperature Variance: {temperatureVariance.toFixed(2)}
          </label>
          <input
            id="temperatureVariance"
            type="range"
            min="0"
            max="0.5"
            step="0.01"
            value={temperatureVariance}
            onChange={(e) => setTemperatureVariance(parseFloat(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label
            htmlFor="elevationTempEffect"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Elevation Effect: {elevationTempEffect.toFixed(2)}
          </label>
          <input
            id="elevationTempEffect"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={elevationTempEffect}
            onChange={(e) => setElevationTempEffect(parseFloat(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label
            htmlFor="visualizationMode"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Visualization Mode:
          </label>
          <select
            id="visualizationMode"
            value={currentVisualizationMode}
            onChange={(e) =>
              setVisualizationMode(e.target.value as VisualizationMode)
            }
            style={{ width: "100%", padding: "5px" }}
          >
            <option value={VisualizationMode.BIOME}>Biome</option>
            <option value={VisualizationMode.NOISE}>Raw Noise</option>
            <option value={VisualizationMode.ELEVATION}>Elevation</option>
            <option value={VisualizationMode.MOISTURE}>Moisture</option>
            <option value={VisualizationMode.TEMPERATURE}>Temperature</option>
            <option value={VisualizationMode.WEIGHT_DISTRIBUTION}>
              Terrain Distribution
            </option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;
