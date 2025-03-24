// Noise generation utility for procedural map generation
// This implementation is based on Perlin noise algorithm

// Simple and fast pseudo-random number generator
// Implementation of Mulberry32 algorithm

import { NOISE_ZOOM } from "./config";
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

// Implementation of Perlin noise with configurable detail and falloff
export class PerlinNoise {
  private perm: number[] = new Array(512);
  private octaves: number;
  private falloff: number;

  constructor(seed: number = 42, octaves: number = 4, falloff: number = 0.5) {
    const random = new Random(seed);

    // Initialize permutation table
    const p = Array.from({ length: 256 }, () => 0);
    for (let i = 0; i < 256; i++) {
      p[i] = i;
    }

    // Shuffle permutation table
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(random.next() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }

    // Duplicate for faster indexing
    for (let i = 0; i < 256; i++) {
      this.perm[i] = this.perm[i + 256] = p[i];
    }

    this.octaves = octaves;
    this.falloff = falloff;
  }

  // Linear interpolation
  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }

  // Fade function for smooth interpolation
  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  // Gradient function
  private grad(hash: number, x: number, y: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  // Base 2D Perlin noise function
  private noise2D(x: number, y: number): number {
    // Find unit grid cell containing point
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    // Get relative xy coordinates of point within that cell
    x -= Math.floor(x);
    y -= Math.floor(y);

    // Compute fade curves for each coordinate
    const u = this.fade(x);
    const v = this.fade(y);

    // Hash coordinates of the 4 square corners
    const a = this.perm[X] + Y;
    const b = this.perm[X + 1] + Y;

    // And add blended results from 4 corners of the square
    return this.lerp(
      this.lerp(
        this.grad(this.perm[a], x, y),
        this.grad(this.perm[b], x - 1, y),
        u
      ),
      this.lerp(
        this.grad(this.perm[a + 1], x, y - 1),
        this.grad(this.perm[b + 1], x - 1, y - 1),
        u
      ),
      v
    );
  }

  // Get multi-octave perlin noise at (x,y)
  get(x: number, y: number): number {
    let value = 0;
    let amplitude = 1;
    let frequency = 2;
    let max = 0;

    // Sum multiple noise functions with different frequencies
    for (let i = 0; i < this.octaves; i++) {
      value += amplitude * this.noise2D(x * NOISE_ZOOM * frequency, y * NOISE_ZOOM * frequency);
      max += amplitude;
      amplitude *= this.falloff;
      frequency *= 2;
    }

    // Normalize result to [0, 1]
    return (value / max + 1) * 0.5;
  }

  // Sets detail level (octaves) and falloff rate
  setDetail(octaves: number, falloff: number): void {
    this.octaves = octaves;
    this.falloff = falloff;
  }
}

// Export a singleton instance with default settings
export const createNoiseGenerator = (
  seed: number,
  octaves: number,
  falloff: number
): PerlinNoise => {
  return new PerlinNoise(seed, octaves, falloff);
};

// Utility functions for terrain generation
export const normalize = (value: number, min: number, max: number): number => {
  if (value < min) return 0;
  if (value > max) return 1;
  return (value - min) / (max - min);
};

// Debug utility to visualize noise values
export const debugNoiseValues = (
  noise: PerlinNoise,
  width: number,
  height: number
): string[][] => {
  const grid: string[][] = [];
  for (let y = 0; y < height; y++) {
    const row: string[] = [];
    for (let x = 0; x < width; x++) {
      const value = noise.get(x / 10, y / 10);
      // Convert to character representation for debugging
      const char =
        value < 0.3
          ? "~"
          : value < 0.4
          ? "-"
          : value < 0.5
          ? "."
          : value < 0.7
          ? "#"
          : value < 0.8
          ? "^"
          : "*";
      row.push(char);
    }
    grid.push(row);
  }
  return grid;
};
