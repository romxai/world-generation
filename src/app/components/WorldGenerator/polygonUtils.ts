// Polygon utilities for generating Voronoi diagrams and applying Lloyd relaxation

// Simple pseudorandom number generator
class Random {
  private state: number;

  constructor(seed: number = Date.now()) {
    this.state = seed;
  }

  // Get next random number in range [0, 1)
  next(): number {
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

// Type definitions for points and polygons
export interface Point {
  x: number;
  y: number;
}

export interface Edge {
  a: Point;
  b: Point;
}

export interface Polygon {
  center: Point; // Center point (site) of the Voronoi cell
  vertices: Point[]; // Vertices of the polygon in clockwise or counter-clockwise order
  neighbors: number[]; // Indices of neighboring polygons
}

/**
 * Generate an array of random points
 * @param count Number of points to generate
 * @param width Width of the area
 * @param height Height of the area
 * @param seed Random seed value
 * @returns Array of random points
 */
export function generateRandomPoints(
  count: number,
  width: number,
  height: number,
  seed: number
): Point[] {
  const random = new Random(seed);
  const points: Point[] = [];

  for (let i = 0; i < count; i++) {
    points.push({
      x: random.next() * width,
      y: random.next() * height,
    });
  }

  return points;
}

/**
 * Calculate the centroid (geometric center) of a polygon
 * @param vertices Array of polygon vertices
 * @returns Centroid point {x, y}
 */
export const calculateCentroid = (vertices: Point[]): Point => {
  if (vertices.length === 0) return { x: 0, y: 0 };

  let sumX = 0;
  let sumY = 0;

  for (const vertex of vertices) {
    sumX += vertex.x;
    sumY += vertex.y;
  }

  return {
    x: sumX / vertices.length,
    y: sumY / vertices.length,
  };
};

/**
 * Apply Lloyd relaxation to improve point distribution
 * Lloyd relaxation moves each point to the centroid of its Voronoi cell
 * @param polygons Array of polygons with vertices and centers
 * @param width Width of the area
 * @param height Height of the area
 * @returns New array of points after relaxation
 */
export const applyLloydRelaxation = (
  polygons: Polygon[],
  width: number,
  height: number
): Point[] => {
  return polygons.map((polygon) => {
    // Calculate the centroid of the polygon
    const centroid = calculateCentroid(polygon.vertices);

    // Clamp the centroid to the bounds
    const x = Math.max(0, Math.min(width, centroid.x));
    const y = Math.max(0, Math.min(height, centroid.y));

    return { x, y };
  });
};

/**
 * Get the distance between two points
 * @param a First point
 * @param b Second point
 * @returns Euclidean distance
 */
export const distance = (a: Point, b: Point): number => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Check if a point is inside a polygon using ray casting algorithm
 * @param point The point to check
 * @param polygon Array of polygon vertices
 * @returns True if the point is inside the polygon
 */
export const isPointInPolygon = (point: Point, polygon: Point[]): boolean => {
  // Ray casting algorithm
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }
  return inside;
};

/**
 * Generate a Voronoi diagram from a set of points using a simple algorithm
 * This is a basic implementation - for production, a proper Voronoi library would be better
 * @param centers Array of center points (sites)
 * @param width Width of the area
 * @param height Height of the area
 * @param padding Padding around the edges
 * @returns Array of polygons
 */
export const generateVoronoiDiagram = (
  centers: Point[],
  width: number,
  height: number,
  padding: number = 0
): Polygon[] => {
  // Create bounding box vertices
  const bounds = [
    { x: padding, y: padding },
    { x: width - padding, y: padding },
    { x: width - padding, y: height - padding },
    { x: padding, y: height - padding },
  ];

  const polygons: Polygon[] = [];

  // For each center point, create a polygon by finding points closer to this center than any other
  for (let i = 0; i < centers.length; i++) {
    const center = centers[i];
    const vertices: Point[] = [];
    const neighbors: number[] = [];

    // Simple approach: Sample points along lines between centers
    // For each other center
    for (let j = 0; j < centers.length; j++) {
      if (i === j) continue;

      const otherCenter = centers[j];

      // Find midpoint between centers (perpendicular bisector)
      const midX = (center.x + otherCenter.x) / 2;
      const midY = (center.y + otherCenter.y) / 2;

      // Vector from center to other center
      const dx = otherCenter.x - center.x;
      const dy = otherCenter.y - center.y;

      // Perpendicular vector (rotated 90 degrees)
      const perpX = -dy;
      const perpY = dx;

      // Length for the perpendicular line
      const perpLength = Math.max(width, height);

      // Calculate points along the perpendicular bisector
      const bisectorPoint1 = {
        x:
          midX +
          (perpX / Math.sqrt(perpX * perpX + perpY * perpY)) * perpLength,
        y:
          midY +
          (perpY / Math.sqrt(perpX * perpX + perpY * perpY)) * perpLength,
      };

      const bisectorPoint2 = {
        x:
          midX -
          (perpX / Math.sqrt(perpX * perpX + perpY * perpY)) * perpLength,
        y:
          midY -
          (perpY / Math.sqrt(perpX * perpX + perpY * perpY)) * perpLength,
      };

      // Add these vertices to the polygon
      vertices.push(bisectorPoint1, bisectorPoint2);

      // Add neighbor relationship
      neighbors.push(j);
    }

    // Clip the polygon against the bounding box
    const clippedVertices = clipPolygonToBounds(vertices, bounds);

    polygons.push({
      center,
      vertices: clippedVertices,
      neighbors,
    });
  }

  return polygons;
};

/**
 * Clip a polygon to a bounding box
 * @param vertices Array of polygon vertices
 * @param bounds Array of bounding box vertices
 * @returns Clipped polygon vertices
 */
export const clipPolygonToBounds = (
  vertices: Point[],
  bounds: Point[]
): Point[] => {
  // For simplicity, just return clipped to the bounding box
  return vertices.filter(
    (v) =>
      v.x >= bounds[0].x &&
      v.x <= bounds[1].x &&
      v.y >= bounds[0].y &&
      v.y <= bounds[2].y
  );
};

/**
 * Identify neighboring polygons
 * @param polygons Array of polygons
 * @returns Updated array of polygons with neighbor information
 */
export const identifyNeighbors = (polygons: Polygon[]): Polygon[] => {
  // For each polygon
  for (let i = 0; i < polygons.length; i++) {
    const neighbors: number[] = [];

    // Check against all other polygons
    for (let j = 0; j < polygons.length; j++) {
      if (i === j) continue;

      // Check if any vertices are shared or very close
      for (const v1 of polygons[i].vertices) {
        for (const v2 of polygons[j].vertices) {
          if (distance(v1, v2) < 0.001) {
            if (!neighbors.includes(j)) {
              neighbors.push(j);
            }
            break;
          }
        }
      }
    }

    polygons[i].neighbors = neighbors;
  }

  return polygons;
};

/**
 * Generate a mesh of polygons using Voronoi diagrams and Lloyd relaxation
 * @param pointCount Number of polygons to generate
 * @param width Width of the area
 * @param height Height of the area
 * @param seed Random seed for reproducibility
 * @param relaxationSteps Number of Lloyd relaxation steps to apply
 * @returns Array of polygons forming a Voronoi diagram
 */
export const generatePolygonMesh = (
  pointCount: number,
  width: number,
  height: number,
  seed: number,
  relaxationSteps: number = 2
): Polygon[] => {
  // Generate initial random points
  let points = generateRandomPoints(pointCount, width, height, seed);

  // Apply Lloyd relaxation to improve point distribution
  for (let i = 0; i < relaxationSteps; i++) {
    // Generate Voronoi diagram
    const polygons = generateVoronoiDiagram(points, width, height);

    // Move points to centroids
    points = applyLloydRelaxation(polygons, width, height);
  }

  // Generate final Voronoi diagram
  const polygons = generateVoronoiDiagram(points, width, height);

  // Identify neighbors
  return identifyNeighbors(polygons);
};
