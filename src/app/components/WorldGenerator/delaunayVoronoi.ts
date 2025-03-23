// Implementation of Delaunay triangulation and Voronoi diagrams
// This provides a more accurate implementation than our basic version in polygonUtils

import { Point } from "./polygonUtils";

// Edge class for Delaunay triangulation
class Edge {
  public a: number; // Index of first point
  public b: number; // Index of second point

  constructor(a: number, b: number) {
    this.a = Math.min(a, b); // Store in sorted order for easier comparison
    this.b = Math.max(a, b);
  }

  // Check if two edges are equal
  equals(other: Edge): boolean {
    return this.a === other.a && this.b === other.b;
  }
}

// Triangle class for Delaunay triangulation
class Triangle {
  public a: number; // Index of first point
  public b: number; // Index of second point
  public c: number; // Index of third point
  public edges: Edge[]; // The three edges of the triangle

  constructor(a: number, b: number, c: number) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.edges = [new Edge(a, b), new Edge(b, c), new Edge(c, a)];
  }

  // Check if a point is inside the triangle's circumcircle
  // This is the key test for Delaunay triangulation
  containsInCircumcircle(points: Point[], p: Point): boolean {
    const a = points[this.a];
    const b = points[this.b];
    const c = points[this.c];

    // Convert to relative coordinates to improve numerical stability
    const ax = a.x - p.x;
    const ay = a.y - p.y;
    const bx = b.x - p.x;
    const by = b.y - p.y;
    const cx = c.x - p.x;
    const cy = c.y - p.y;

    // Compute determinant to check if point is in circumcircle
    const det =
      (ax * ax + ay * ay) * (bx * cy - cx * by) -
      (bx * bx + by * by) * (ax * cy - cx * ay) +
      (cx * cx + cy * cy) * (ax * by - bx * ay);

    return det > 0;
  }

  // Check if the triangle contains a given vertex index
  hasVertex(index: number): boolean {
    return this.a === index || this.b === index || this.c === index;
  }
}

/**
 * Compute the Delaunay triangulation of a set of points
 * @param points Array of points
 * @returns Array of triangles forming a Delaunay triangulation
 */
export function delaunayTriangulation(points: Point[]): Triangle[] {
  if (points.length < 3) {
    return []; // Need at least 3 points
  }

  // Find bounds for the super-triangle
  let minX = points[0].x;
  let minY = points[0].y;
  let maxX = minX;
  let maxY = minY;

  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }

  const dx = (maxX - minX) * 10;
  const dy = (maxY - minY) * 10;

  // Add three points for the super-triangle
  // The super-triangle needs to contain all input points
  const stIdx = points.length;
  const superTrianglePoints: Point[] = [
    { x: minX - dx, y: minY - dy * 3 },
    { x: minX + maxX + dx, y: minY - dy },
    { x: minX - dx, y: minY + maxY + dy },
  ];

  // Combine original points with super-triangle points
  const allPoints = [...points, ...superTrianglePoints];

  // Start with the super-triangle
  const triangles: Triangle[] = [new Triangle(stIdx, stIdx + 1, stIdx + 2)];

  // Add each point one by one
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const edges: Edge[] = [];

    // Find all triangles whose circumcircle contains this point
    const badTriangles: Triangle[] = [];
    for (const triangle of triangles) {
      if (triangle.containsInCircumcircle(allPoints, point)) {
        badTriangles.push(triangle);
        // Save the edges for later
        edges.push(...triangle.edges);
      }
    }

    // Remove bad triangles from the list
    for (const bad of badTriangles) {
      const index = triangles.indexOf(bad);
      if (index !== -1) {
        triangles.splice(index, 1);
      }
    }

    // Find unique edges (ones that appear only once)
    const uniqueEdges: Edge[] = [];
    for (const edge of edges) {
      let isUnique = true;
      for (let j = 0; j < edges.length; j++) {
        if (edge !== edges[j] && edge.equals(edges[j])) {
          isUnique = false;
          break;
        }
      }
      if (isUnique) {
        uniqueEdges.push(edge);
      }
    }

    // Create new triangles from unique edges and the new point
    for (const edge of uniqueEdges) {
      triangles.push(new Triangle(edge.a, edge.b, i));
    }
  }

  // Remove any triangles that have a vertex from the super-triangle
  return triangles.filter(
    (t) =>
      !t.hasVertex(stIdx) && !t.hasVertex(stIdx + 1) && !t.hasVertex(stIdx + 2)
  );
}

/**
 * Calculate the circumcenter of a triangle
 * @param a First point
 * @param b Second point
 * @param c Third point
 * @returns The circumcenter point
 */
function circumcenter(a: Point, b: Point, c: Point): Point {
  // Calculate perpendicular bisectors
  const ab_x = (a.x + b.x) / 2;
  const ab_y = (a.y + b.y) / 2;
  const ab_dx = b.x - a.x;
  const ab_dy = b.y - a.y;

  const bc_x = (b.x + c.x) / 2;
  const bc_y = (b.y + c.y) / 2;
  const bc_dx = c.x - b.x;
  const bc_dy = c.y - b.y;

  // Perpendicular slopes
  const ab_slope = -ab_dx / (ab_dy || 0.0001); // Avoid division by zero
  const bc_slope = -bc_dx / (bc_dy || 0.0001);

  // Calculate circumcenter using line intersection
  const x =
    (ab_slope * ab_x - bc_slope * bc_x + bc_y - ab_y) /
    (ab_slope - bc_slope || 0.0001);
  const y = ab_slope * (x - ab_x) + ab_y;

  return { x, y };
}

/**
 * Generate a Voronoi diagram from a Delaunay triangulation
 * @param points Array of input points (the sites)
 * @param triangles Array of Delaunay triangles
 * @param width Width of the bounding box
 * @param height Height of the bounding box
 * @returns Array of polygons forming a Voronoi diagram
 */
export function voronoiFromDelaunay(
  points: Point[],
  triangles: Triangle[],
  width: number,
  height: number
): { vertices: Point[]; cells: number[][] }[] {
  // Initialize Voronoi cells for each input point
  const cells: { vertices: Point[]; cells: number[][] }[] = points.map(() => ({
    vertices: [],
    cells: [],
  }));

  // Calculate circumcenters for each triangle
  const circumcenters: Point[] = triangles.map((triangle) => {
    const a = points[triangle.a];
    const b = points[triangle.b];
    const c = points[triangle.c];
    return circumcenter(a, b, c);
  });

  // Build adjacency list of triangles
  const adjacentTriangles: number[][] = points.map(() => []);
  for (let i = 0; i < triangles.length; i++) {
    const triangle = triangles[i];
    adjacentTriangles[triangle.a].push(i);
    adjacentTriangles[triangle.b].push(i);
    adjacentTriangles[triangle.c].push(i);
  }

  // Generate Voronoi cells for each input point
  for (let i = 0; i < points.length; i++) {
    // Get all triangles containing this point
    const adjacentTri = adjacentTriangles[i];

    // Skip if point is not part of any triangle
    if (adjacentTri.length === 0) continue;

    // Get circumcenters of adjacent triangles, which are the vertices of the Voronoi cell
    const vertexIndices: number[] = [];
    for (const triIdx of adjacentTri) {
      vertexIndices.push(triIdx);
    }

    // Get the actual vertices (circumcenters)
    const vertices = vertexIndices.map((idx) => circumcenters[idx]);

    // Sort vertices in counter-clockwise order around the point
    const center = points[i];
    vertices.sort((a, b) => {
      const angleA = Math.atan2(a.y - center.y, a.x - center.x);
      const angleB = Math.atan2(b.y - center.y, b.x - center.x);
      return angleA - angleB;
    });

    // Clip the cell to the bounding box if needed
    const clippedVertices = clipPolygonToBoundingBox(
      vertices,
      0,
      0,
      width,
      height
    );

    // Store the cell
    cells[i] = {
      vertices: clippedVertices,
      cells: vertexIndices,
    };
  }

  return cells;
}

/**
 * Clip a polygon to a bounding box
 * @param vertices Polygon vertices
 * @param minX Minimum X coordinate
 * @param minY Minimum Y coordinate
 * @param maxX Maximum X coordinate
 * @param maxY Maximum Y coordinate
 * @returns Clipped polygon vertices
 */
function clipPolygonToBoundingBox(
  vertices: Point[],
  minX: number,
  minY: number,
  maxX: number,
  maxY: number
): Point[] {
  // Simple clipping: just ensure all vertices are within bounds
  return vertices.map((v) => ({
    x: Math.max(minX, Math.min(maxX, v.x)),
    y: Math.max(minY, Math.min(maxY, v.y)),
  }));
}

/**
 * Generate a Voronoi diagram using Delaunay triangulation
 * @param points Array of input points (the sites)
 * @param width Width of the bounding box
 * @param height Height of the bounding box
 * @returns Array of Voronoi cells with vertices
 */
export function generateVoronoiDiagram(
  points: Point[],
  width: number,
  height: number
): { center: Point; vertices: Point[] }[] {
  // Create Delaunay triangulation
  const triangles = delaunayTriangulation(points);

  // Generate Voronoi cells from Delaunay triangulation
  const voronoiCells = voronoiFromDelaunay(points, triangles, width, height);

  // Format result
  return points.map((point, i) => ({
    center: point,
    vertices: voronoiCells[i]?.vertices || [],
  }));
}

/**
 * Apply Lloyd relaxation to improve point distribution
 * @param points Array of points
 * @param width Width of the area
 * @param height Height of the area
 * @param iterations Number of relaxation iterations
 * @returns Improved array of points after relaxation
 */
export function lloydRelaxation(
  points: Point[],
  width: number,
  height: number,
  iterations: number = 1
): Point[] {
  let currentPoints = [...points];

  for (let iter = 0; iter < iterations; iter++) {
    // Generate Voronoi diagram
    const voronoiCells = generateVoronoiDiagram(currentPoints, width, height);

    // Move each point to the centroid of its Voronoi cell
    currentPoints = voronoiCells.map((cell, i) => {
      // If cell has no vertices, keep original point
      if (cell.vertices.length === 0) {
        return currentPoints[i];
      }

      // Calculate centroid
      let sumX = 0;
      let sumY = 0;
      for (const vertex of cell.vertices) {
        sumX += vertex.x;
        sumY += vertex.y;
      }

      // New point position is the centroid
      return {
        x: Math.max(0, Math.min(width, sumX / cell.vertices.length)),
        y: Math.max(0, Math.min(height, sumY / cell.vertices.length)),
      };
    });
  }

  return currentPoints;
}
