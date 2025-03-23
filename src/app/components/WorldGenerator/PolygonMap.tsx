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
  TerrainType,
  BIOME_PRESETS,
  VisualizationMode,
  calculateTerrainHeights,
  LOW_ZOOM_THRESHOLD,
  TERRAIN_HEIGHTS,
  BiomeWeights,
} from "./config";
import {
  DEFAULT_POLYGON_COUNT,
  DEFAULT_RELAXATION_STEPS,
  POLYGON_EDGE_COLOR,
  POLYGON_EDGE_WIDTH,
  POLYGON_EDGE_VISIBLE_THRESHOLD,
  ADAPTIVE_POLYGON_SETTINGS,
  ENABLE_POLYGON_CACHING,
  CACHE_MAX_SIZE,
} from "./polygonConfig";
import { PerlinNoise, createNoiseGenerator } from "./noiseGenerator";
import {
  RGB,
  rgbToString,
  getTerrainTypeForHeight,
  getTerrainColor,
} from "./terrainUtils";
import {
  generatePolygonTerrain,
  TerrainPolygon,
  rasterizePolygonTerrain,
} from "./polygonTerrain";
import { Polygon, Point, generateRandomPoints } from "./polygonUtils";
import { makeNoise2D } from "fast-simplex-noise";
import { generateTileGrid } from "./terrainUtils";
import { generateVoronoiDiagram, lloydRelaxation } from "./delaunayVoronoi";
import styles from "./WorldMap.module.css";

// Props for the PolygonMap component
interface PolygonMapProps {
  width?: number;
  height?: number;
  tileSize?: number;
  seed?: number;
  debug?: boolean;
  biomeWeights?: BiomeWeights | number[];
  noiseDetail?: number;
  noiseFalloff?: number;
  visualizationMode?: "terrain";
}

// Camera state interface
interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

// Cache for terrain data to avoid regeneration
interface CachedTerrain {
  seed: number;
  zoom: number;
  biomeWeights: number[];
  polygonCount: number;
  relaxationSteps: number;
  terrain: TerrainPolygon[];
  rasterizedImage?: ImageData;
}

const PolygonMap: React.FC<PolygonMapProps> = ({
  width = WINDOW_WIDTH,
  height = WINDOW_HEIGHT,
  tileSize = DEFAULT_TILE_SIZE,
  seed = DEFAULT_SEED,
  debug = DEBUG_MODE,
  biomeWeights = BIOME_PRESETS.CONTINENTS,
  noiseDetail = NOISE_DETAIL,
  noiseFalloff = NOISE_FALLOFF,
  visualizationMode = "terrain" as VisualizationMode,
}) => {
  // Canvas and rendering references
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Camera state for position and zoom
  const [camera, setCamera] = useState<CameraState>({
    x: 0,
    y: 0,
    zoom: INITIAL_ZOOM,
  });

  // State for mouse position and interaction
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);
  const [mapChanged, setMapChanged] = useState(true);
  const [debugInfo, setDebugInfo] = useState("");

  // Cache for terrain polygons at different zoom levels
  const [terrainCache, setTerrainCache] = useState<CachedTerrain[]>([]);

  // Create memoized terrain height thresholds based on biome weights
  const terrainHeights = useMemo(() => {
    // If BiomeWeights object is provided, convert to array format
    if (
      biomeWeights &&
      typeof biomeWeights === "object" &&
      !Array.isArray(biomeWeights)
    ) {
      const weights = [
        (biomeWeights.ocean || 0.5) * 20, // Combine ocean types
        (biomeWeights.ocean || 0.5) * 10,
        (biomeWeights.ocean || 0.5) * 10,
        biomeWeights.beach || 0.05,
        biomeWeights.plains || 0.2,
        biomeWeights.mountains || 0.07,
        biomeWeights.snow || 0.03,
      ];
      return calculateTerrainHeights(weights);
    }

    // Use array format directly if it's already an array
    return calculateTerrainHeights(
      Array.isArray(biomeWeights) ? biomeWeights : BIOME_PRESETS.CONTINENTS
    );
  }, [biomeWeights]);

  // Create noise generator
  const noiseGeneratorRef = useRef<PerlinNoise>(
    createNoiseGenerator(seed, noiseDetail, noiseFalloff)
  );

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

  // Get polygon generation settings based on zoom level
  const getPolygonSettings = useCallback((zoom: number) => {
    if (zoom < ADAPTIVE_POLYGON_SETTINGS.veryLow.threshold) {
      return {
        polygonCount: ADAPTIVE_POLYGON_SETTINGS.veryLow.polygonCount,
        relaxationSteps: ADAPTIVE_POLYGON_SETTINGS.veryLow.relaxationSteps,
      };
    } else if (zoom < ADAPTIVE_POLYGON_SETTINGS.low.threshold) {
      return {
        polygonCount: ADAPTIVE_POLYGON_SETTINGS.low.polygonCount,
        relaxationSteps: ADAPTIVE_POLYGON_SETTINGS.low.relaxationSteps,
      };
    } else if (zoom < ADAPTIVE_POLYGON_SETTINGS.medium.threshold) {
      return {
        polygonCount: ADAPTIVE_POLYGON_SETTINGS.medium.polygonCount,
        relaxationSteps: ADAPTIVE_POLYGON_SETTINGS.medium.relaxationSteps,
      };
    } else if (zoom < ADAPTIVE_POLYGON_SETTINGS.high.threshold) {
      return {
        polygonCount: ADAPTIVE_POLYGON_SETTINGS.high.polygonCount,
        relaxationSteps: ADAPTIVE_POLYGON_SETTINGS.high.relaxationSteps,
      };
    } else {
      return {
        polygonCount: ADAPTIVE_POLYGON_SETTINGS.veryHigh.polygonCount,
        relaxationSteps: ADAPTIVE_POLYGON_SETTINGS.veryHigh.relaxationSteps,
      };
    }
  }, []);

  // Generate or retrieve terrain polygons based on current settings
  const getTerrainPolygons = useCallback(
    (
      zoomLevel: number,
      seed: number,
      weights: BiomeWeights | number[]
    ): TerrainPolygon[] => {
      // Convert BiomeWeights to array if needed
      const biomeWeightsArray: number[] = Array.isArray(weights)
        ? weights
        : [
            (weights.ocean || 0.5) * 20, // Combine ocean types
            (weights.ocean || 0.5) * 10,
            (weights.ocean || 0.5) * 10,
            weights.beach || 0.05,
            weights.plains || 0.2,
            weights.mountains || 0.07,
            weights.snow || 0.03,
          ];

      // Get appropriate polygon settings for the current zoom level
      const { polygonCount, relaxationSteps } = getPolygonSettings(zoomLevel);

      // Check if we have a cached version for this zoom level
      if (ENABLE_POLYGON_CACHING) {
        const cached = terrainCache.find(
          (cache) =>
            cache.seed === seed &&
            cache.zoom === zoomLevel &&
            cache.polygonCount === polygonCount &&
            cache.relaxationSteps === relaxationSteps &&
            JSON.stringify(cache.biomeWeights) ===
              JSON.stringify(biomeWeightsArray)
        );

        if (cached) {
          return cached.terrain;
        }
      }

      // If not cached, generate new terrain
      const newTerrain = generatePolygonTerrain(
        WORLD_GRID_WIDTH,
        WORLD_GRID_HEIGHT,
        polygonCount,
        seed,
        noiseGeneratorRef.current,
        biomeWeightsArray,
        relaxationSteps
      );

      // Update the cache with new terrain
      if (ENABLE_POLYGON_CACHING) {
        setTerrainCache((prevCache) => {
          // Create new cache entry
          const newEntry: CachedTerrain = {
            seed,
            zoom: zoomLevel,
            biomeWeights: [...biomeWeightsArray],
            polygonCount,
            relaxationSteps,
            terrain: newTerrain,
          };

          // Limit cache size
          const newCache = [...prevCache, newEntry].slice(-CACHE_MAX_SIZE);
          return newCache;
        });
      }

      return newTerrain;
    },
    [terrainCache, getPolygonSettings]
  );

  // Calculate which grid cells are visible in the current view
  const getVisibleGridCells = (
    camera: CameraState,
    zoom: number
  ): {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } => {
    // Calculate actual tile size with zoom applied
    const currentTileSize = calculateTileSize(zoom);

    // Tiles visible in viewport
    const tilesX = Math.ceil(width / currentTileSize) + 1; // +1 to handle partial tiles
    const tilesY = Math.ceil(height / currentTileSize) + 1;

    // Calculate the starting tile based on camera position
    // Camera position is center of view, so offset by half the visible tiles
    const startX = Math.max(0, Math.floor(camera.x - tilesX / 2));
    const startY = Math.max(0, Math.floor(camera.y - tilesY / 2));

    // Calculate the ending tile, clamped to world boundaries
    const endX = Math.min(WORLD_GRID_WIDTH - 1, startX + tilesX);
    const endY = Math.min(WORLD_GRID_HEIGHT - 1, startY + tilesY);

    return { startX, startY, endX, endY };
  };

  // Get color based on the current visualization mode
  const getVisualizationColor = (
    noiseValue: number,
    terrainType: TerrainType
  ): RGB => {
    switch (visualizationMode) {
      case "noise":
        // Display raw noise values as grayscale
        const val = Math.round(noiseValue * 255);
        return { r: val, g: val, b: val };

      case "elevation":
        // Display elevation using a gradient from blue (low) to white (high)
        return {
          r: Math.round(40 + noiseValue * 215),
          g: Math.round(40 + noiseValue * 215),
          b: Math.round(200 + noiseValue * 55),
        };

      case "weight":
        // Show how weights affect terrain distribution
        // Each terrain type gets a distinct color
        const colors = [
          { r: 0, g: 0, b: 180 }, // Deep Ocean - dark blue
          { r: 30, g: 30, b: 220 }, // Medium Ocean - medium blue
          { r: 50, g: 50, b: 250 }, // Shallow Ocean - light blue
          { r: 240, g: 240, b: 180 }, // Beach - sand color
          { r: 50, g: 180, b: 50 }, // Grass - green
          { r: 100, g: 100, b: 100 }, // Mountain - gray
          { r: 255, g: 255, b: 255 }, // Snow - white
        ];

        return colors[terrainType];

      case "terrain":
      default:
        // Default biome colors with interpolation
        return getTerrainColor(noiseValue, terrainType, terrainHeights);
    }
  };

  // Draw the polygon map to the canvas
  const drawPolygonMap = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      offCtx: CanvasRenderingContext2D,
      polygons: TerrainPolygon[],
      visible: { startX: number; startY: number; endX: number; endY: number }
    ) => {
      // Clear the canvas
      offCtx.clearRect(0, 0, width, height);

      // Calculate current tile size for rendering
      const currentTileSize = calculateTileSize(camera.zoom);

      // Calculate pixel offset for rendering (to handle partial tiles)
      const offsetX = (camera.x - visible.startX) * currentTileSize;
      const offsetY = (camera.y - visible.startY) * currentTileSize;

      // Draw each polygon
      for (const polygon of polygons) {
        // Quick check if polygon might be visible
        if (
          polygon.center.x >= visible.startX - 10 &&
          polygon.center.x <= visible.endX + 10 &&
          polygon.center.y >= visible.startY - 10 &&
          polygon.center.y <= visible.endY + 10
        ) {
          // Transform polygon vertices to screen space
          const screenVertices = polygon.vertices.map((vertex) => ({
            x:
              (vertex.x - visible.startX) * currentTileSize -
              offsetX +
              width / 2,
            y:
              (vertex.y - visible.startY) * currentTileSize -
              offsetY +
              height / 2,
          }));

          // Draw the polygon
          if (screenVertices.length > 2) {
            // Apply visualization mode color
            const color =
              visualizationMode === "terrain"
                ? polygon.color
                : getVisualizationColor(
                    polygon.noiseValue,
                    polygon.terrainType
                  );

            offCtx.fillStyle = rgbToString(color);
            offCtx.beginPath();
            offCtx.moveTo(screenVertices[0].x, screenVertices[0].y);

            for (let i = 1; i < screenVertices.length; i++) {
              offCtx.lineTo(screenVertices[i].x, screenVertices[i].y);
            }

            offCtx.closePath();
            offCtx.fill();

            // Draw polygon edges if zoom level is high enough
            if (camera.zoom >= POLYGON_EDGE_VISIBLE_THRESHOLD) {
              offCtx.strokeStyle = POLYGON_EDGE_COLOR;
              offCtx.lineWidth = POLYGON_EDGE_WIDTH;
              offCtx.stroke();
            }
          }
        }
      }

      // Draw grid overlay if enabled and zoom level is high enough
      if (debug && SHOW_GRID && camera.zoom >= GRID_VISIBLE_THRESHOLD) {
        offCtx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        offCtx.lineWidth = 0.5;

        // Draw vertical grid lines
        for (let x = visible.startX; x <= visible.endX; x++) {
          const screenX =
            (x - visible.startX) * currentTileSize - offsetX + width / 2;
          offCtx.beginPath();
          offCtx.moveTo(screenX, 0);
          offCtx.lineTo(screenX, height);
          offCtx.stroke();
        }

        // Draw horizontal grid lines
        for (let y = visible.startY; y <= visible.endY; y++) {
          const screenY =
            (y - visible.startY) * currentTileSize - offsetY + height / 2;
          offCtx.beginPath();
          offCtx.moveTo(0, screenY);
          offCtx.lineTo(width, screenY);
          offCtx.stroke();
        }
      }

      // Show coordinates in debug mode when zoomed in far enough
      if (debug && SHOW_COORDS && camera.zoom >= COORDS_VISIBLE_THRESHOLD) {
        offCtx.fillStyle = "rgba(255, 255, 255, 0.7)";
        offCtx.font = `${Math.max(8, currentTileSize / 4)}px Arial`;

        for (let y = visible.startY; y <= visible.endY; y++) {
          for (let x = visible.startX; x <= visible.endX; x++) {
            const screenX =
              (x - visible.startX) * currentTileSize - offsetX + width / 2;
            const screenY =
              (y - visible.startY) * currentTileSize - offsetY + height / 2;

            offCtx.fillText(
              `${x},${y}`,
              screenX + 2,
              screenY + Math.max(8, currentTileSize / 4)
            );
          }
        }
      }

      // Additional visualization mode overlay indicators
      if (visualizationMode !== "terrain") {
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
      ctx.drawImage(offscreenCanvasRef.current!, 0, 0);
    },
    [
      width,
      height,
      camera,
      debug,
      visualizationMode,
      terrainHeights,
      calculateTileSize,
    ]
  );

  // Animation loop for camera movement and rendering
  useEffect(() => {
    let animationFrameId: number;

    const updateCamera = () => {
      let changed = false;

      // Calculate movement speed based on zoom level
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

  // Main render function
  useEffect(() => {
    if (!mapChanged) return;

    const canvas = canvasRef.current;
    const offscreenCanvas = offscreenCanvasRef.current;

    if (!canvas || !offscreenCanvas) return;

    const ctx = canvas.getContext("2d");
    const offCtx = offscreenCanvas.getContext("2d");

    if (!ctx || !offCtx) return;

    // Get current visible area
    const visibleArea = getVisibleGridCells(camera, camera.zoom);

    // Generate or retrieve polygons for the current view
    const polygons = getTerrainPolygons(camera.zoom, seed, biomeWeights);

    // Draw the map
    drawPolygonMap(ctx, offCtx, polygons, visibleArea);

    // Update debug info if enabled
    if (debug) {
      // Get current tile size based on zoom level
      const currentTileSize = calculateTileSize(camera.zoom);

      // Calculate pixel offset for rendering
      const offsetX = (camera.x - visibleArea.startX) * currentTileSize;
      const offsetY = (camera.y - visibleArea.startY) * currentTileSize;

      // Calculate the world position of the mouse
      const mouseWorldX =
        visibleArea.startX +
        (mousePos.x - width / 2 + offsetX) / currentTileSize;
      const mouseWorldY =
        visibleArea.startY +
        (mousePos.y - height / 2 + offsetY) / currentTileSize;

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
        // Find the polygon at this position
        const point: Point = { x: mouseWorldX, y: mouseWorldY };
        const polygon = polygons.find((poly) =>
          poly.gridCells.some((cell) => cell.x === tileX && cell.y === tileY)
        );

        if (polygon) {
          // Update debug info
          setDebugInfo(
            `Tile: (${tileX}, ${tileY}) | ` +
              `Noise: ${polygon.noiseValue.toFixed(3)} | ` +
              `Terrain: ${TerrainType[polygon.terrainType]} | ` +
              `Zoom: ${camera.zoom.toFixed(2)} | ` +
              `Polygons: ${polygons.length} | ` +
              `Camera: (${camera.x.toFixed(1)}, ${camera.y.toFixed(1)})`
          );
        }
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
    seed,
    biomeWeights,
    mousePos,
    visualizationMode,
    terrainHeights,
    getTerrainPolygons,
    drawPolygonMap,
  ]);

  // Generate points and Voronoi cells
  const { points, cells } = useMemo(() => {
    // Calculate how many points to generate based on the map dimensions and density factor
    const pointCount = Math.max(
      50,
      Math.floor((width * height * 0.01) / (tileSize * tileSize))
    );

    // Generate initial random points
    let randomPoints = generateRandomPoints(pointCount, width, height, seed);

    // Apply Lloyd relaxation to make the distribution more even
    randomPoints = lloydRelaxation(randomPoints, width, height, 2);

    // Generate Voronoi diagram from the points
    const voronoiCells = generateVoronoiDiagram(randomPoints, width, height);

    return { points: randomPoints, cells: voronoiCells };
  }, [width, height, seed, tileSize]);

  // Generate elevation data for each cell
  const cellElevation = useMemo(() => {
    return points.map((point: Point) => {
      // Sample noise at the cell center for elevation
      // Use multiple octaves of noise for more detailed terrain
      let elevation = 0;
      let amplitude = 1;
      let frequency = 1;
      let maxAmplitude = 0;

      for (let i = 0; i < noiseDetail; i++) {
        const nx = (point.x / width) * frequency;
        const ny = (point.y / height) * frequency;

        elevation += noiseGeneratorRef.current.get(nx, ny) * amplitude;
        maxAmplitude += amplitude;
        amplitude *= noiseFalloff;
        frequency *= 2;
      }

      // Normalize to 0-1 range
      return (elevation / maxAmplitude + 1) / 2;
    });
  }, [points, width, height, noiseDetail, noiseFalloff]);

  // Get color for a specific visualization mode for Voronoi cells
  const getVisualizationColorVoronoi = (
    elevation: number,
    x: number,
    y: number
  ): string => {
    switch (visualizationMode) {
      case "elevation":
        // Grayscale based on elevation
        const brightness = Math.floor(elevation * 255);
        return `rgb(${brightness}, ${brightness}, ${brightness})`;

      case "noise":
        // Raw noise visualization (color gradient)
        return `hsl(${Math.floor(elevation * 360)}, 70%, 50%)`;

      case "terrain":
      default:
        // Get terrain type based on elevation
        const terrainType = getTerrainTypeForHeight(elevation, terrainHeights);
        const color = getTerrainColor(terrainType, elevation, terrainHeights);
        return rgbToString(color);
    }
  };

  // Draw the map on the canvas
  const drawMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations for pan and zoom
    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);

    // Draw each Voronoi cell as a polygon
    cells.forEach((cell, index) => {
      if (cell.vertices.length < 3) return; // Skip cells with insufficient vertices

      const elevation = cellElevation[index];
      const color = getVisualizationColorVoronoi(
        elevation,
        cell.center.x,
        cell.center.y
      );

      // Draw polygon
      ctx.beginPath();
      ctx.moveTo(cell.vertices[0].x, cell.vertices[0].y);

      for (let i = 1; i < cell.vertices.length; i++) {
        ctx.lineTo(cell.vertices[i].x, cell.vertices[i].y);
      }

      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Draw cell borders if debug is enabled
      if (debug) {
        ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    });

    // Draw cell centers if debug is enabled
    if (debug) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
      points.forEach((point: Point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    ctx.restore();
  };

  // Initialize canvas and event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Draw initial map
    drawMap();

    // Mouse event handlers for panning
    const handleMouseDown = (e: MouseEvent) => {
      setIsDragging(true);
      setDragStartX(e.clientX - camera.x);
      setDragStartY(e.clientY - camera.y);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      setCamera((prevCamera) => {
        const newX =
          prevCamera.x + (e.clientX - dragStartX - width / 2) / prevCamera.zoom;
        const newY =
          prevCamera.y +
          (e.clientY - dragStartY - height / 2) / prevCamera.zoom;
        return { ...prevCamera, x: newX, y: newY };
      });

      // Redraw the map
      drawMap();
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Wheel event handler for zooming
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Calculate zoom center (mouse position)
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate zoom delta
      const zoomDelta = -e.deltaY * 0.001;
      const newZoom = Math.max(0.1, Math.min(camera.zoom + zoomDelta, 5));

      // Adjust offset to zoom towards mouse position
      const zoomRatio = newZoom / camera.zoom;
      const newOffsetX = mouseX - (mouseX - camera.x) * zoomRatio;
      const newOffsetY = mouseY - (mouseY - camera.y) * zoomRatio;

      // Update state
      setCamera((prevCamera) => ({
        ...prevCamera,
        zoom: newZoom,
        x: newOffsetX,
        y: newOffsetY,
      }));

      // Redraw the map
      drawMap();
    };

    // Add event listeners
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp);
    canvas.addEventListener("wheel", handleWheel);

    // Clean up event listeners
    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseUp);
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [width, height, camera, isDragging, dragStartX, dragStartY]);

  // Redraw map when visualization mode or other parameters change
  useEffect(() => {
    drawMap();
  }, [visualizationMode, debug, terrainHeights]);

  return (
    <div
      ref={containerRef}
      className={styles.worldMapContainer}
      style={{ width, height }}
    >
      <canvas
        ref={canvasRef}
        className={styles.worldMapCanvas}
        width={width}
        height={height}
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

export default PolygonMap;
