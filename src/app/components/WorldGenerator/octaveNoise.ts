/**
 * octaveNoise.ts
 *
 * Implements advanced multi-octave noise generation for more realistic terrain.
 * This module enhances the base PerlinNoise implementation with support for:
 * - Multiple octaves of varying frequencies and amplitudes
 * - Configurable octave weights
 * - Separate noise generators for elevation and moisture
 */

import { PerlinNoise, createNoiseGenerator } from "./noiseGenerator";
import {
  DEFAULT_OCTAVES,
  DEFAULT_OCTAVE_WEIGHT,
  DEFAULT_ELEVATION_SCALE,
  DEFAULT_MOISTURE_SCALE,
} from "./config";

/**
 * Interface for octave parameters
 */
export interface OctaveParams {
  frequency: number; // How "zoomed in" this octave is (higher = more detail)
  amplitude: number; // How much this octave contributes to the final value
}

/**
 * Parameters for the octave noise generator
 */
export interface OctaveNoiseParams {
  seed: number; // Base seed for the noise
  octaveCount: number; // Number of octaves to use
  baseFrequency?: number; // Starting frequency for the first octave
  persistence?: number; // How quickly the amplitude decreases (0-1)
  lacunarity?: number; // How quickly the frequency increases (typically 2)
  scale?: number; // Overall scale factor
  octaveSeedOffset?: number; // Offset between octave seeds
}

/**
 * OctaveNoise class - handles multi-octave noise generation
 */
export class OctaveNoise {
  private seed: number;
  private octaveCount: number;
  private baseFrequency: number;
  private persistence: number;
  private lacunarity: number;
  private scale: number;
  private octaveSeedOffset: number;
  private noiseGenerators: PerlinNoise[];
  private octaveParams: OctaveParams[] = [];

  /**
   * Creates a new OctaveNoise instance
   * @param params Configuration parameters
   */
  constructor(params: OctaveNoiseParams) {
    this.seed = params.seed;
    this.octaveCount = params.octaveCount;
    this.baseFrequency = params.baseFrequency || 1.0;
    this.persistence = params.persistence || DEFAULT_OCTAVE_WEIGHT;
    this.lacunarity = params.lacunarity || 2.0;
    this.scale = params.scale || 1.0;
    this.octaveSeedOffset = params.octaveSeedOffset || 1000;

    // Initialize octave parameters
    this.calculateOctaveParams();

    // Create noise generators for each octave with different seeds
    this.noiseGenerators = [];
    for (let i = 0; i < this.octaveCount; i++) {
      // Each octave gets a different seed based on the base seed
      const octaveSeed = this.seed + i * this.octaveSeedOffset;
      this.noiseGenerators.push(createNoiseGenerator(octaveSeed, 1, 0.5));
    }
  }

  /**
   * Calculates parameters for each octave based on persistence and lacunarity
   * @private
   */
  private calculateOctaveParams(): void {
    this.octaveParams = [];
    let frequency = this.baseFrequency;
    let amplitude = 1.0;

    for (let i = 0; i < this.octaveCount; i++) {
      this.octaveParams.push({
        frequency,
        amplitude,
      });

      // Increase frequency and decrease amplitude for each octave
      frequency *= this.lacunarity;
      amplitude *= this.persistence;
    }
  }

  /**
   * Gets noise value at the specified coordinates using all octaves
   * @param x X coordinate
   * @param y Y coordinate
   * @returns Noise value between 0 and 1
   */
  get(x: number, y: number): number {
    let value = 0;
    let maxValue = 0;

    // Apply scaling factor to coordinates
    const scaledX = x / this.scale;
    const scaledY = y / this.scale;

    // Sum contributions from all octaves
    for (let i = 0; i < this.octaveCount; i++) {
      const { frequency, amplitude } = this.octaveParams[i];
      const noiseGen = this.noiseGenerators[i];

      // Add weighted contribution from this octave
      value +=
        amplitude * noiseGen.get(scaledX * frequency, scaledY * frequency);
      maxValue += amplitude;
    }

    // Normalize result to range [0, 1]
    return value / maxValue;
  }

  /**
   * Updates the parameters of this noise generator
   * @param params New parameters
   */
  updateParams(params: Partial<OctaveNoiseParams>): void {
    if (params.seed !== undefined) this.seed = params.seed;
    if (params.octaveCount !== undefined) this.octaveCount = params.octaveCount;
    if (params.baseFrequency !== undefined)
      this.baseFrequency = params.baseFrequency;
    if (params.persistence !== undefined) this.persistence = params.persistence;
    if (params.lacunarity !== undefined) this.lacunarity = params.lacunarity;
    if (params.scale !== undefined) this.scale = params.scale;
    if (params.octaveSeedOffset !== undefined)
      this.octaveSeedOffset = params.octaveSeedOffset;

    // Recalculate octave parameters
    this.calculateOctaveParams();

    // Recreate noise generators if octave count changed
    if (
      params.seed !== undefined ||
      params.octaveCount !== undefined ||
      params.octaveSeedOffset !== undefined
    ) {
      this.noiseGenerators = [];
      for (let i = 0; i < this.octaveCount; i++) {
        const octaveSeed = this.seed + i * this.octaveSeedOffset;
        this.noiseGenerators.push(createNoiseGenerator(octaveSeed, 1, 0.5));
      }
    }
  }
}

/**
 * Creates an elevation noise generator with default parameters
 * @param seed The base seed for the noise generator
 * @param octaveCount Number of octaves to use
 * @returns New OctaveNoise instance configured for elevation
 */
export function createElevationNoise(
  seed: number,
  octaveCount: number = DEFAULT_OCTAVES
): OctaveNoise {
  return new OctaveNoise({
    seed,
    octaveCount,
    baseFrequency: 1.0,
    persistence: 0.5,
    lacunarity: 2.0,
    scale: DEFAULT_ELEVATION_SCALE,
    octaveSeedOffset: 1000,
  });
}

/**
 * Creates a moisture noise generator with default parameters
 * @param seed The base seed for the noise generator
 * @param octaveCount Number of octaves to use
 * @returns New OctaveNoise instance configured for moisture
 */
export function createMoistureNoise(
  seed: number,
  octaveCount: number = DEFAULT_OCTAVES
): OctaveNoise {
  return new OctaveNoise({
    seed: seed + 5000, // Different base seed than elevation
    octaveCount,
    baseFrequency: 0.8, // Slightly different frequency
    persistence: 0.6,
    lacunarity: 2.0,
    scale: DEFAULT_MOISTURE_SCALE,
    octaveSeedOffset: 2000,
  });
}

/**
 * Utility function to generate octave debug information
 * @param noise The noise generator to debug
 * @param x X-coordinate to sample
 * @param y Y-coordinate to sample
 * @returns Detailed debug information about all octaves
 */
export function debugOctaveNoise(
  noise: OctaveNoise,
  x: number,
  y: number
): string {
  if (noise instanceof OctaveNoise) {
    const finalValue = noise.get(x, y);
    return `OctaveNoise(${x}, ${y}) = ${finalValue.toFixed(4)}`;
  }
  return "Not an OctaveNoise instance";
}
