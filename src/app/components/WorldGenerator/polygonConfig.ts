// Configuration settings for polygon-based map generation

// Number of relaxation steps for Lloyd's algorithm
// Higher values create more evenly distributed, regular polygons
export const DEFAULT_RELAXATION_STEPS = 2;

// Number of polygons to generate
// This controls the resolution of the map - more polygons = more detailed terrain
export const DEFAULT_POLYGON_COUNT = 5000;

// Rasterization settings
export const RASTER_SCALE = 1.0; // Scale factor for rasterization
export const RASTER_QUALITY_LOW = 0.5; // Scale factor for low-quality rasterization
export const RASTER_QUALITY_HIGH = 1.0; // Scale factor for high-quality rasterization

// Polygon edge rendering
export const POLYGON_EDGE_COLOR = "rgba(0, 0, 0, 0.2)"; // Color of polygon edges
export const POLYGON_EDGE_WIDTH = 0.5; // Width of polygon edges
export const POLYGON_EDGE_VISIBLE_THRESHOLD = 1.0; // Zoom threshold for polygon edges visibility

// Performance settings
export const POLYGON_VISIBLE_MARGIN = 10; // Margin around visible area to check for polygons

// Constants for different polygon distribution types
export enum PolygonDistribution {
  UNIFORM = "uniform", // Evenly distributed polygons
  VARIABLE = "variable", // Higher density in land areas, lower in water
  CLUSTERED = "clustered", // Clusters of polygons
}

// Settings for adaptive polygon resolution
// These determine how many polygons are used at different zoom levels
export const ADAPTIVE_POLYGON_SETTINGS = {
  // At very low zoom levels, use minimal polygons for performance
  veryLow: {
    threshold: 0.2, // Zoom level below 0.2
    polygonCount: 1000, // Use 1000 polygons
    relaxationSteps: 1, // Only 1 relaxation step
  },
  // At low zoom levels, use fewer polygons for performance
  low: {
    threshold: 0.5, // Zoom level below 0.5
    polygonCount: 2000, // Use 2000 polygons
    relaxationSteps: 1, // Only 1 relaxation step
  },
  // At medium zoom levels, use medium polygon count
  medium: {
    threshold: 1.0, // Zoom level below 1.0
    polygonCount: 3500, // Use 3500 polygons
    relaxationSteps: 2, // 2 relaxation steps
  },
  // At high zoom levels, use maximum polygon count
  high: {
    threshold: 2.0, // Zoom level above 1.0
    polygonCount: 5000, // Use 5000 polygons
    relaxationSteps: 2, // 2 relaxation steps
  },
  // At very high zoom levels, use maximum detail
  veryHigh: {
    threshold: 999, // Any zoom level above high
    polygonCount: 8000, // Use 8000 polygons
    relaxationSteps: 3, // 3 relaxation steps
  },
};

// Cache settings
export const ENABLE_POLYGON_CACHING = true; // Whether to cache polygon generation results
export const CACHE_MAX_SIZE = 3; // Maximum number of cached polygon sets (for different zoom levels)
